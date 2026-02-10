/* MOISETECH: SYSTÈME D'ÉPURATION DES FRONTIÈRES 💠 */

export default {
    name: "anticountry",
    alias: ["anti", "kickcountry"],
    category: "ADMIN",

    async execute(sock, m, args) {
        if (!m.isGroup) return m.reply("❌ Cette opération nécessite un déploiement en groupe, Monarque.");

        // 1. FORCER LA SYNCHRONISATION DES DROITS (Règle le bug de reconnaissance admin)
        const groupMetadata = await sock.groupMetadata(m.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Identification du statut du bot
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);
        const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
        
        if (!isBotAdmin) {
            return m.reply("🛡️ *ERREUR D'AUTORITÉ :* Je ne suis pas encore reconnu comme **Admin**.\n\n_Veuillez me nommer Admin et patienter 5 secondes avant de retenter._");
        }

        // 2. RÉCUPÉRATION DE L'INDICATIF CIBLE (ex: 229)
        const prefix = args[0]?.replace('+', '').trim();
        if (!prefix || isNaN(prefix)) {
            return m.reply("📝 *Instruction incomplète.*\nUsage : `.anti 229` (pour purger tout le pays visé).");
        }

        // 3. IDENTIFICATION DES CIBLES (Exclut le bot et les admins)
        const targets = groupMetadata.participants.filter(p => 
            p.id.split('@')[0].startsWith(prefix) && 
            p.id !== botId && 
            p.admin === null   // Cible uniquement les membres non-admins
        );

        if (targets.length === 0) {
            return m.reply(`✅ *Analyse terminée :* Aucun membre (+${prefix}) n'a été détecté dans les rangs des soldats.`);
        }

        await m.reply(`⚔️ *ÉPURATION ACTIVÉE :* ${targets.length} membres (+${prefix}) vont être extraits du secteur.`);

        // 4. EXÉCUTION DE LA PURGE (Optimisation RAM Katabump)
        for (let target of targets) {
            try {
                // Expulsion de la cible
                await sock.groupParticipantsUpdate(m.chat, [target.id], "remove");
                
                // Délai de 1.2s pour éviter la surcharge du serveur
                await new Promise(res => setTimeout(res, 1200)); 
            } catch (e) {
                console.error("❌ Échec de l'extraction sur une cible.");
            }
        }

        m.reply(`💠 *OPÉRATION TERMINÉE.* La zone est désormais purgée des numéros +${prefix}.`);
    }
};
