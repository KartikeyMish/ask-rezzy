/**
 * Set up Server-Sent Events (SSE) response
 * @param {Object} res - Express response object
 */
function createSSEResponse(res) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
  
  // Set up heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000); // Send heartbeat every 30 seconds
  
  // Clean up on close
  res.on('close', () => {
    clearInterval(heartbeatInterval);
  });
  
  // Send initial connection established event
  res.write('event: connected\ndata: {}\n\n');
}

module.exports = {
  createSSEResponse,
};