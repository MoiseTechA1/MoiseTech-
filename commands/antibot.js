import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

const dataDir = './data';
const antiBotFile = path.join(dataDir, "antiBotGroups.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

global.antiBotGroups = global.antiBotGroups || (fs.existsSync(antiBotFile) ? JSON.parse(fs.readFileSync(antiBotFile, "utf-8")) : {});

export default {
  name: "antibot",
  alias: ["anti-bot"],
  category: "SÉCURITÉ",
  group: true,
  admin: true,

  execute: async (sock, m, args) => {
    const action = args[0]?.toLowerCase();
    const chatId = m.chat;

    if (!action || !["on", "off"].includes(action)) {
      return m.reply(`🛡️ *INTERFACE ANTI-BOT*\n\n🔹 \`.antibot on\` | Activer\n🔹 \`.antibot off\` | Désactiver`);
    }

    const check = await checkAdminOrOwner(sock, chatId, m.sender);
    if (!check.isAdminOrOwner) return m.reply("🚫 Privilèges insuffisants.");

    if (action === "on") {
      global.antiBotGroups[chatId] = true;
      fs.writeFileSync(antiBotFile, JSON.stringify(global.antiBotGroups, null, 2));
      return m.reply("✅ *ANTIBOT ACTIVÉ.* Les bots tiers seront neutralisés.");
    }

    if (action === "off") {
      delete global.antiBotGroups[chatId];
      fs.writeFileSync(antiBotFile, JSON.stringify(global.antiBotGroups, null, 2));
      return m.reply("❌ *ANTIBOT DÉSACTIVER.*");
    }
  },

  monitor: async (sock, m) => {
    if (!m.isGroup || m.fromMe || !m.id) return;
    if (!global.antiBotGroups[m.chat]) return;

    // On ignore les admins
    const check = await checkAdminOrOwner(sock, m.chat, m.sender);
    if (check.isAdminOrOwner) return;

    /**
     * DÉTECTION CHIRURGICALE
     * BAE5 / 3EB0 : Signatures classiques des bots Baileys
     * On enlève la détection par longueur d'ID (trop risqué)
     */
    const isBot = m.id.startsWith("BAE5") || m.id.startsWith("3EB0") || m.id.startsWith("3A");

    if (isBot) {
      try {
        await sock.sendMessage(m.chat, { delete: m.key });
        console.log(`⚔️ [Anti-Bot] Neutralisé : ${m.sender}`);
      } catch (err) {
        console.error("Erreur Anti-Bot");
      }
    }
  }
};
