import React, { useState } from 'react';
import AuctionList from '../components/AuctionList';
import AuctionRoom from '../components/AuctionRoom';
import '../components/Auction.css';

/**
 * Example page demonstrating how to use Auction components
 * 
 * To use this page:
 * 1. Import it in your routes
 * 2. Add to your router: <Route path="/auction-demo" element={<AuctionDemo />} />
 * 3. Navigate to /auction-demo
 */
export const AuctionDemo: React.FC = () => {
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [userId] = useState('demo-user-123'); // Replace with actual user ID from auth

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>🔨 Auction Demo Page</h1>
        <p>This page demonstrates the Auction functionality</p>
      </div>

      {!selectedAuctionId ? (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
            <h3>📋 Instructions:</h3>
            <ol>
              <li>Browse the list of available auctions below</li>
              <li>Click "Xem chi tiết" on any auction to enter the auction room</li>
              <li>In the auction room, you can place bids in real-time</li>
              <li>Click "Back to List" to return to the auction list</li>
            </ol>
          </div>

          {/* Demo showing AuctionList component */}
          <AuctionList />
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => setSelectedAuctionId(null)}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ← Back to List
            </button>
          </div>

          {/* Demo showing AuctionRoom component */}
          <AuctionRoom 
            auctionId={selectedAuctionId} 
            userId={userId}
          />
        </>
      )}

      {/* Quick link to enter a specific auction by ID */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#fef3c7', 
        borderRadius: '8px',
        border: '1px solid #fde68a'
      }}>
        <h4>🎯 Quick Access by Auction ID</h4>
        <p>Enter an auction ID to jump directly to that auction room:</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Enter auction ID..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  setSelectedAuctionId(value);
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="text"]') as HTMLInputElement;
              const value = input?.value.trim();
              if (value) {
                setSelectedAuctionId(value);
              } else {
                alert('Please enter an auction ID');
              }
            }}
            style={{
              padding: '10px 20px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Go to Auction
          </button>
        </div>
      </div>

      {/* API Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f3f4f6', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Current Configuration:</strong>
        <ul>
          <li>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</li>
          <li>Socket URL: {import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'}</li>
          <li>Demo User ID: {userId}</li>
        </ul>
      </div>
    </div>
  );
};

export default AuctionDemo;
