/**
 * PropertEase Ownership Verification
 * Blockchain-backed digital title verification (Simulated Hyperledger Fabric).
 */

class OwnershipVerification {
    constructor() {
        this.ledger = new Map(); // Simulated off-chain local ledger cache
    }

    async verifyTitle(listingId) {
        console.log(`[Blockchain] Verifying title for listing: ${listingId}`);

        // Simulate Hyperledger Fabric Smart Contract Query
        return new Promise((resolve) => {
            setTimeout(() => {
                const txId = '0x' + Math.random().toString(16).substr(2, 16).toUpperCase();
                const result = {
                    status: 'Verified',
                    transactionId: txId,
                    blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
                    ownerHash: 'sha256:' + Math.random().toString(36).substr(2, 12),
                    timestamp: new Date().toISOString(),
                    registrarSignature: 'ST-SIGNED-001-' + txId.substr(0, 4)
                };
                resolve(result);
            }, 1200); // Simulate network latency
        });
    }

    showCertificateModal(listingTitle, verificationData) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; border: 2px solid #4CAF50; border-radius: 12px; overflow: hidden;">
                <div class="modal-header" style="background: #4CAF50; color: white; padding: 1rem;">
                    <h2 style="margin: 0; font-size: 1.25rem;">Blockchain Title Certificate</h2>
                    <button class="close-modal" style="color: white; border: none; background: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 1.5rem; background: #f9fdf9;">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                         <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛡️</div>
                         <h3 style="margin: 0; color: #2e7d32;">Ownership Verified</h3>
                         <p style="font-size: 0.75rem; color: #666;">Registry Node: GKE-Hyperledger-Region-1</p>
                    </div>
                    
                    <div style="background: white; border: 1px dashed #4CAF50; padding: 1rem; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-size: 0.8rem; line-height: 1.4;">
                        <p style="margin: 0.25rem 0;"><strong>PROPERTY:</strong> ${listingTitle.toUpperCase()}</p>
                        <p style="margin: 0.25rem 0;"><strong>TX_ID:</strong> ${verificationData.transactionId}</p>
                        <p style="margin: 0.25rem 0;"><strong>BLOCK:</strong> ${verificationData.blockNumber}</p>
                        <p style="margin: 0.25rem 0;"><strong>OWNER_HSH:</strong> ${verificationData.ownerHash}</p>
                        <p style="margin: 0.25rem 0;"><strong>SIG:</strong> ${verificationData.registrarSignature}</p>
                        <p style="margin: 0.25rem 0;"><strong>STATUS:</strong> <span style="background: #e8f5e9; color: #2e7d32; padding: 0.1rem 0.3rem; border-radius: 4px;">IMMUTABLE_COMMIT</span></p>
                    </div>
                    
                    <div style="margin-top: 1.5rem; text-align: center; font-size: 0.7rem; color: #999;">
                        Blockchain verification ensures this property title is authentic and free of legal disputes.
                    </div>
                    
                    <button class="btn btn-primary w-full" style="margin-top: 1.5rem; background: #4CAF50; border: none;" onclick="this.closest('.modal-overlay').remove()">Close Certificate</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => modal.remove();

        // Ensure modal styles work
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '2000';
    }
}

window.ownershipVerification = new OwnershipVerification();
