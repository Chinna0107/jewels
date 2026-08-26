const fs = require('fs');

const file = '/Users/hemanthkancharla/jewelsbe/routes/general.js';
let content = fs.readFileSync(file, 'utf8');

const searchBlock = `  } catch (err) {
    console.error('Address validation error:', err.message);
    // Don't block checkout on validation errors
    res.json({ valid: true, message: 'Address validation skipped' });
  }`;

const replaceBlock = `  } catch (err) {
    console.error('Address validation error:', err.message);
    let errMsg = err.message;
    // Try to extract useful info from Shippo error string
    try {
      const match = err.message.match(/Body:\\s*({.*})/i);
      if (match) {
        const parsed = JSON.parse(match[1]);
        if (parsed.address_to && parsed.address_to[0] && parsed.address_to[0].__all__) {
          errMsg = parsed.address_to[0].__all__[0];
        } else if (parsed.__all__) {
          errMsg = parsed.__all__[0];
        }
      }
    } catch(e) {}
    res.json({ valid: false, message: errMsg });
  }`;

if (!content.includes(searchBlock)) {
  console.log("Could not find the target code to replace!");
  process.exit(1);
}

content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync(file, content);
console.log("Address validation error handling patched.");
