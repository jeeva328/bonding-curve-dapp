"use client"

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { parseEther, formatEther } from 'viem';
import { toast } from 'react-toastify';
import Link from "@mui/material/Link";

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance, useReadContract } from "wagmi";
import { BondingCurveTokenAbi } from "@/app/abi/BondingCurveTokenAbi";

export default function TradeTabs() {
  const { 
    writeContractAsync: buyContractAsync, 
    data: buyHash, 
    isPending: isBuyPending,
    error: buyError 
  } = useWriteContract();
  
  const { 
    writeContractAsync: sellContractAsync, 
    data: sellHash, 
    isPending: isSellPending,
    error: sellError 
  } = useWriteContract();

  const [tabValue, setTabValue] = React.useState("buy");

  const [bnbAmount, setBnbAmount] = React.useState("");
  const [estimateTokens, setEstimateTokens] = React.useState("");

  const [tokenAmount, setTokenAmount] = React.useState("");
  const [estimateBnb, setEstimateBnb] = React.useState("");

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const formatBalance = (bal: any) => {
    if (!bal) return '0';
    return parseFloat(bal.formatted).toFixed(6);
  };

  const contractAddress = process.env.NEXT_PUBLIC_BONDING_CURVE_TOKEN_CONTRACT_ADDRESS as `0x${string}` | undefined;
  const bscTxUrl = process.env.NEXT_PUBLIC_BSC_TX_URL;

  // Read user token balance from contract
  const { data: userTokenBalance, refetch: refetchBalance } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!contractAddress,
      refetchInterval: 10000,
    }
  });

  // Read current price for calculations
  const { data: currentPrice } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'price',
    query: {
      enabled: isConnected && !!contractAddress,
      refetchInterval: 10000,
    }
  });

  const { 
    isLoading: isBuyLoading, 
    isSuccess: isBuySuccess, 
    isError: isBuyError 
  } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const { 
    isLoading: isSellLoading, 
    isSuccess: isSellSuccess, 
    isError: isSellError 
  } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  React.useEffect(() => {
    if (isBuySuccess) {
      toast.success(`Tokens purchased successfully! TX: ${buyHash?.slice(0, 10)}...`);
      setBnbAmount("");
      setEstimateTokens("");
      refetchBalance();
    }
  }, [isBuySuccess, buyHash, refetchBalance]);

  React.useEffect(() => {
    if (isSellSuccess) {
      toast.success(`Tokens sold successfully! TX: ${sellHash?.slice(0, 10)}...`);
      setTokenAmount("");
      setEstimateBnb("");
      refetchBalance();
    }
  }, [isSellSuccess, sellHash, refetchBalance]);

  React.useEffect(() => {
    if (isBuyError || buyError) {
      toast.error('Buy transaction failed');
    }
  }, [isBuyError, buyError]);

  React.useEffect(() => {
    if (isSellError || sellError) {
      toast.error('Sell transaction failed');
    }
  }, [isSellError, sellError]);

  const validateDecimals = (value: string) => {
    if (value === "") return true;
    if (!/^\d*\.?\d*$/.test(value)) return false;
    const parts = value.split(".");
    if (parts.length === 2 && parts[1].length > 6) return false;
    return true;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setBnbAmount("");
    setEstimateTokens("");
    setTokenAmount("");
    setEstimateBnb("");
  };

  const handleBnbAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (validateDecimals(val)) {
      setBnbAmount(val);
      
      if (val && currentPrice) {
        const ethValue = parseFloat(val);
        const priceInEth = parseFloat(formatEther(currentPrice as bigint));
        const estimatedTokens = (ethValue / priceInEth).toFixed(6);

        setEstimateTokens(estimatedTokens);
      } else {
        setEstimateTokens("");
      }
    }
  };

  const handleTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (validateDecimals(val)) {
      setTokenAmount(val);
      
      if (val && currentPrice) {
        const tokenValue = parseFloat(val);
        const priceInEth = parseFloat(formatEther(currentPrice as bigint));
        const estimatedEth = (tokenValue * priceInEth).toFixed(6);
        setEstimateBnb(estimatedEth);
      } else {
        setEstimateBnb("");
      }
    }
  };

  const handleBuy = async () => {
    if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
      toast.error('Please enter a valid BNB amount');
      return;
    }

    if (!contractAddress) {
      toast.error('Contract address not configured');
      return;
    }

    try {
      const hash = await buyContractAsync({
        address: contractAddress,
        abi: BondingCurveTokenAbi,
        functionName: "buyTokens",
        value: parseEther(bnbAmount), 
      });
      console.log('Buy transaction hash:', hash);
    } catch (error) {
      let errorMessage = "Buy transaction failed";
      if (error instanceof Error) {
        errorMessage = error.message.toLowerCase().includes("user rejected")
          ? "Transaction rejected by user"
          : error.message;
      console.error('Buy transaction failed:', error);
      toast.error(errorMessage);
    }
  }
  };

  const handleSell = async () => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast.error('Please enter a valid token amount');
      return;
    }

    if (!contractAddress) {
      toast.error('Contract address not configured');
      return;
    }

    try {
      const hash = await sellContractAsync({
        address: contractAddress,
        abi: BondingCurveTokenAbi,
        functionName: "sellTokens",
        args: [parseEther(tokenAmount)], 
      });
      console.log('Sell transaction hash:', hash);
    } catch (error) {
      let errorMessage = "Sell transaction failed";
      if (error instanceof Error) {
        errorMessage = error.message.toLowerCase().includes("user rejected")
          ? "Transaction rejected by user"
          : error.message;
      console.error('Sell transaction failed:', error);
      toast.error(errorMessage);
    }
  }
  };

  const formatUserBalance = () => {
    if (!userTokenBalance) return "0.00";
    return parseFloat(formatEther(userTokenBalance as bigint)).toFixed(4);
  };

  const isBuyDisabled = !bnbAmount || parseFloat(bnbAmount) === 0 || isBuyPending || isBuyLoading || !isConnected || parseFloat(bnbAmount) > parseFloat(formatBalance(balance));
  const isSellDisabled = !tokenAmount || parseFloat(tokenAmount) === 0 || isSellPending || isSellLoading || !isConnected || parseFloat(tokenAmount) > parseFloat(formatUserBalance());

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 3 }}>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="Buy and Sell Tabs"
          centered
        >
          <Tab value="buy" label="Buy" />
          <Tab value="sell" label="Sell" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tabValue === "buy" && (
            <Stack spacing={2}>
              <TextField
                label="BNB Amount"
                variant="outlined"
                fullWidth
                value={bnbAmount}
                onChange={handleBnbAmountChange}
                inputMode="decimal"
                type="text"
                disabled={isBuyPending || isBuyLoading}
                helperText={isBuyPending ? "Confirming transaction..." : isBuyLoading ? "Processing..." : ""}
              />
              <TextField
                label="Estimate Tokens"
                variant="outlined"
                fullWidth
                value={estimateTokens}
                disabled
                helperText="Estimated tokens you'll receive"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleBuy}
                disabled={isBuyDisabled}
                sx={{ py: 1.5 }}
              >
                {isBuyPending ? 'Confirming...' : isBuyLoading ? 'Processing...' : 'Buy Tokens'}
              </Button>
              {buyHash && bscTxUrl && (
                <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Link 
                    href={`${bscTxUrl}${buyHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: 'success.contrastText', 
                      fontFamily: 'monospace',
                      textDecoration: 'underline'
                    }}
                  >
                    TX: {buyHash.slice(0, 10)}...{buyHash.slice(-8)}
                  </Link>
                </Box>
              )}
            </Stack>
          )}

          {tabValue === "sell" && (
            <Stack spacing={2}>
              <TextField
                label="Token Amount"
                variant="outlined"
                fullWidth
                value={tokenAmount}
                onChange={handleTokenAmountChange}
                helperText={`You have ${formatUserBalance()} tokens`}
                inputMode="decimal"
                type="text"
                disabled={isSellPending || isSellLoading}
              />
              <TextField
                label="Estimate BNB"
                variant="outlined"
                fullWidth
                value={estimateBnb}
                disabled
                helperText="Estimated ETH you'll receive"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSell}
                disabled={isSellDisabled}
                sx={{ py: 1.5 }}
              >
                {isSellPending ? 'Confirming...' : isSellLoading ? 'Processing...' : 'Sell Tokens'}
              </Button>
              {sellHash && bscTxUrl &&(
                <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Link 
                    href={`${bscTxUrl}${sellHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: 'success.contrastText', 
                      fontFamily: 'monospace',
                      textDecoration: 'underline'
                    }}
                  >
                    TX: {sellHash.slice(0, 10)}...{sellHash.slice(-8)}
                  </Link>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}