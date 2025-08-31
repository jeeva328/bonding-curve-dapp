"use client";

import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
   
  const { data: balance } = useBalance({
    address: address,
  });

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: any) => {
    if (!bal) return '0';
    return parseFloat(bal.formatted).toFixed(4);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800">
              Coin Fantasy
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-600">
                    {formatAddress(address as string)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatBalance(balance)} {balance?.symbol}
                  </span>
                </div>
                
                <button
                  onClick={handleDisconnect}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.55 18.54l1.41 1.41 1.79-1.8c.32.27.71.48 1.14.62V20h2v-1.23c.43-.14.82-.35 1.14-.62l1.79 1.8 1.41-1.41-1.8-1.79c.27-.32.48-.71.62-1.14H13v-2h-1.23c-.14-.43-.35-.82-.62-1.14l1.8-1.79-1.41-1.41-1.79 1.8c-.32-.27-.71-.48-1.14-.62V9h-2v1.23c-.43.14-.82.35-1.14.62l-1.79-1.8L3.55 10.46l1.8 1.79c-.27.32-.48.71-.62 1.14H3v2h1.23c.14.43.35.82.62 1.14l-1.8 1.79z"/>
                </svg>
                <span>Connect MetaMask</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;