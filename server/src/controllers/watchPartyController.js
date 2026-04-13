import { prisma } from '../lib/prisma.js';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
export const createParty = async (req, res) => {
    try {
        const { title, animeId, animeTitle, isPrivate } = req.body;
        const hostId = req.userId;
        const code = nanoid();
        const party = await prisma.watchParty.create({
            data: {
                code,
                hostId,
                title,
                animeId: String(animeId),
                animeTitle,
                isPrivate: isPrivate || false
            }
        });
        res.status(201).json(party);
    }
    catch (error) {
        console.error('Create party error:', error);
        res.status(500).json({ message: 'Error creating watch party' });
    }
};
export const getActiveParties = async (req, res) => {
    try {
        const parties = await prisma.watchParty.findMany({
            where: { isPrivate: false },
            include: {
                host: { select: { username: true, avatar: true } },
                _count: { select: { members: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(parties);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching parties' });
    }
};
export const getPartyByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const party = await prisma.watchParty.findUnique({
            where: { code: String(code) },
            include: {
                host: { select: { username: true, avatar: true, id: true } },
                members: { include: { user: { select: { username: true, avatar: true } } } }
            }
        });
        if (!party)
            return res.status(404).json({ message: 'Party not found' });
        res.status(200).json(party);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching party' });
    }
};
export const updatePartyState = async (req, res) => {
    try {
        const { code } = req.params;
        const { status, currentTime, episode } = req.body;
        const userId = req.userId;
        const party = await prisma.watchParty.findUnique({ where: { code: String(code) } });
        if (!party)
            return res.status(404).json({ message: 'Party not found' });
        // Only host can update base state in DB
        if (party.hostId !== userId) {
            return res.status(403).json({ message: 'Only host can update party state' });
        }
        const updated = await prisma.watchParty.update({
            where: { code: String(code) },
            data: {
                status: status, // Cast to match Prisma enum if needed
                currentTime: Number(currentTime),
                episode: Number(episode)
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating party state' });
    }
};
//# sourceMappingURL=watchPartyController.js.map