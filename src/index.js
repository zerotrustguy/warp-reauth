export default {
  async scheduled(event, env, ctx) {
    const API_TOKEN = env.API_TOKEN;
    const ACCOUNT_ID = env.ACCOUNT_ID;
    const REVOKE_INTERVAL_MINUTES = parseInt(env.REVOKE_INTERVAL_MINUTES); // Reuse for inactivity threshold
    const DRY_RUN = env.DRY_RUN === 'true';

    const headers = {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    let cursor = '';
    let allDevices = [];

    // Fetch all registrations with cursor-based pagination
    while (true) {
      let url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/devices/registrations?per_page=100`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const devicesResponse = await fetch(url, { headers });
      const devicesData = await devicesResponse.json();
      if (!devicesData.success) {
        console.error('Failed to fetch registrations:', devicesData.errors);
        return;
      }

      allDevices = allDevices.concat(devicesData.result);

      // Extract next cursor (adjust if your response uses a different field, e.g., devicesData.result_info.cursor)
      cursor = devicesData.cursor || '';
      if (!cursor) break;
    }

    const now = new Date();

    for (const device of allDevices) {
      const lastSeen = new Date(device.last_seen_at);
      const minutesInactive = (now - lastSeen) / (1000 * 60);

      if (minutesInactive > REVOKE_INTERVAL_MINUTES) {
        console.log(`Registration ${device.id} inactive for ${minutesInactive} minutes.`);

        if (DRY_RUN) {
          console.log(`Dry run: Would delete registration ${device.id}`);
        } else {
          const deleteResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/devices/registrations/${device.id}`,
            { method: 'DELETE', headers }
          );
          const deleteData = await deleteResponse.json();
          if (deleteData.success) {
            console.log(`Deleted registration ${device.id}`);
          } else {
            console.error(`Failed to delete ${device.id}:`, deleteData.errors);
          }
        }
      }
    }
  }
};