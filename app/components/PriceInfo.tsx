"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { BondingCurveTokenAbi } from '@/app/abi/BondingCurveTokenAbi';

export default function PriceInfo() {
  const { isConnected } = useAccount();
  const contractAddress = process.env.NEXT_PUBLIC_BONDING_CURVE_TOKEN_CONTRACT_ADDRESS as `0x${string}` | undefined;

  // Read base price from contract
  const { data: basePrice, isLoading: isBasePriceLoading } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'basePrice',
    query: {
      enabled: isConnected && !!contractAddress,
      refetchInterval: 40000, // Refetch every 40 seconds
    }
  });

  // Read slope from contract
  const { data: slope, isLoading: isSlopeLoading } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'slope',
    query: {
      enabled: isConnected && !!contractAddress,
      refetchInterval: 40000,
    }
  });

  // Read current price from contract
  const { data: currentPrice, isLoading: isCurrentPriceLoading } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'price',
    query: {
      enabled: isConnected && !!contractAddress,
      refetchInterval: 40000, 
    }
  });

  // Read total supply for additional info
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useReadContract({
    address: contractAddress,
    abi: BondingCurveTokenAbi,
    functionName: 'totalSupply',
    query: {
      enabled: isConnected && !!contractAddress,
      refetchInterval: 40000,
    }
  });

  // Format values for display
  const formatPrice = (price: bigint | undefined) => {
    if (!price) return "0.000000";
    return parseFloat(formatEther(price)).toFixed(6);
  };

  const formatSupply = (supply: bigint | undefined) => {
    if (!supply) return "0.0000";
    return parseFloat(formatEther(supply)).toFixed(4);
  };

  // Show loading skeleton if not connected or data is loading
  const isLoading = !isConnected || isBasePriceLoading || isSlopeLoading || isCurrentPriceLoading || isTotalSupplyLoading;

  return (
    <Card sx={{ maxWidth: 345, mt: -30, ml: 6, boxShadow: 3 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Bonding Curve Parameters
        </Typography>
        
        {!isConnected ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
              Connect wallet to view contract data
            </Typography>
          </Box>
        ) : !contractAddress ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 2 }}>
              Contract address not configured
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                Base Price:
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {formatPrice(basePrice)} ETH
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                Slope:
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <Typography variant="body1" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                  {formatPrice(slope)} ETH
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'primary.light', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body2" sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>
                Current Price:
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <Typography variant="h6" sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                  {formatPrice(currentPrice)} ETH
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
              <Typography variant="body2" sx={{ color: 'secondary.contrastText', fontWeight: 'medium' }}>
                Total Supply:
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <Typography variant="body1" sx={{ color: 'secondary.contrastText', fontWeight: 'bold' }}>
                  {formatSupply(totalSupply)} Tokens
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {contractAddress && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
