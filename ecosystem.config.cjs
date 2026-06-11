// PM2 ecosystem for hsmcp.invoker.nl
//
// Runs help-scout-mcp-server in HTTP mode behind Traefik.
// Single instance — no clustering (HS API rate limits are server-wide anyway,
// adding workers wouldn't help and would multiply OAuth2 token refreshes).
//
// Restart policy: always restart on crash, but back off if we crash 5x in a
// minute (probably misconfig — env hosed, port taken, etc).
//
// Update flow: cd /home/claude/projects/hsmcp && git pull && pm2 restart hsmcp

module.exports = {
  apps: [
    {
      name: 'hsmcp',
      cwd: '/home/claude/projects/hsmcp',
      script: './dist/index.js',
      interpreter: 'node',
      // Loads HELPSCOUT_APP_ID/SECRET, HSMCP_BEARER_TOKENS, MCP_HTTP_PORT, etc.
      // PM2 reads .env automatically when env_file is set; we keep it explicit.
      env_file: '/home/claude/projects/hsmcp/.env',
      // Single instance — see file header
      instances: 1,
      exec_mode: 'fork',
      // Restart policy
      autorestart: true,
      max_restarts: 5,
      min_uptime: '60s',
      restart_delay: 2000,
      // Logs
      out_file: '/home/claude/projects/hsmcp/logs/out.log',
      error_file: '/home/claude/projects/hsmcp/logs/err.log',
      merge_logs: true,
      time: true,
      // Memory cap — restart if leak balloons over 512MB
      max_memory_restart: '512M',
    },
  ],
};
