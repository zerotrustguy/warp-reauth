Add secrets as below from the CLI or add it to your workers dashboard

npx wrangler secret put API_TOKEN
npx wrangler secret put ACCOUNT_ID
npx wrangler secret put REVOKE_INTERVAL_MINUTES

You can also add REVOKE_INTERVAL_MINUTES into your wrangler.json or wrangler.toml, API TOKEN and ACCOUNT ID should be added as secret only.

Based on your REVOKE_INTERVAL_MINUTES, the script should delete the warp registration of the user and prompt them to relogin, mimicing the legacy VPN behaviour.
