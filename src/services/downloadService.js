const Players = require('../models/Player');
const TournamentPlayers = require('../models/TournamentPlayers');
const TournamentTeams = require('../models/TournamentTeams');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const axios = require('axios');
const mongoose = require('mongoose');
const { createCanvas, loadImage } = require('canvas');

// Add this

module.exports = {

    downloadTournamentPlayers: (tournamentId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const players = await TournamentPlayers.aggregate([
                    {
                        $match: { tournament: new mongoose.Types.ObjectId(tournamentId) }
                    },
                    {
                        $lookup: {
                            from: "players",
                            localField: 'player',
                            foreignField: '_id',
                            as: 'playerDetails'
                        }
                    },
                    {
                        $unwind: '$playerDetails'
                    },
                    {
                        $project: {
                            _id: 0,
                            playerId: '$playerDetails._id',
                            firstName: '$playerDetails.firstName',
                            lastName: '$playerDetails.lastName',
                            email: '$playerDetails.email',
                            contactNumber: '$playerDetails.contactNumber',
                            dateOfBirth: '$playerDetails.dateOfBirth',
                            photoUrl: '$playerDetails.photoUrl',
                            sport: '$playerDetails.sport',
                            playerCategory: '$playerDetails.playerCategory',
                            cricHeroesId: '$playerDetails.cricHeroesId'
                        }
                    }
                ])



                console.log("downloadTournamentPlayers players", players);

                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const usersPerPage = 10;
                const totalPages = Math.ceil(players.length / usersPerPage);
                const pageSize = { width: 595.28, height: 841.89 }; // A4

                for (let i = 0; i < totalPages; i++) {
                    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
                    const { width, height } = page.getSize();

                    // Page Title
                    page.drawText(`Tournament Players - Page ${i + 1}`, {
                        x: 50,
                        y: height - 50,
                        size: 16,
                        font,
                        color: rgb(0, 0, 0.6),
                    });

                    const startY = height - 80;
                    const rowHeight = 70;
                    const baseX = 50;

                    const slice = players.slice(i * usersPerPage, (i + 1) * usersPerPage);
                    for (const [index, player] of slice.entries()) {
                        const y = startY - index * rowHeight;

                        // Card-like background
                        page.drawRectangle({
                            x: baseX - 10,
                            y: y - 35,
                            width: 500,
                            height: 50,
                            color: rgb(0.95, 0.95, 1),
                            borderColor: rgb(0.6, 0.6, 0.6),
                            borderWidth: 0.5,
                        });

                        // --- Add player image from local folder ---
                        if (player.photoUrl) {
                            try {

                                const imageUrl = `${process.env.BASE_URL}/media/${player.photoUrl}`;
                                console.log("Image URL:", imageUrl);

                                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                const imageBuffer = response.data;

                                let imageEmbed;

                                if (player.photoUrl.toLowerCase().endsWith('.png')) {
                                    imageEmbed = await pdfDoc.embedPng(imageBuffer);
                                } else if (player.photoUrl.toLowerCase().endsWith('.jpg') || player.photoUrl.toLowerCase().endsWith('.jpeg')) {
                                    imageEmbed = await pdfDoc.embedJpg(imageBuffer);
                                }
                                else {
                                    imageEmbed = await pdfDoc.embedJpg(imageBuffer);
                                }
                                page.drawImage(imageEmbed, {
                                    x: baseX,
                                    y: y - 30,
                                    width: 40,
                                    height: 40,
                                });
                            } catch (imgErr) {
                                // Ignore image errors, continue
                            }
                        }




                        // --- End image ---

                        const fullName = `${player.firstName} ${player.lastName}`;
                        const dateOfBirth = new Date(player.dateOfBirth).toLocaleDateString();
                        const cricId = player.cricHeroesId || "N/A";

                        page.drawText(`${index + 1 + i * usersPerPage}. ${fullName} (${player.sport})`, {
                            x: baseX + 50, // Shift right to make space for image
                            y: y,
                            size: 12,
                            font,
                            color: rgb(0.1, 0.2, 0.6),
                        });

                        page.drawText(`DOB: ${dateOfBirth} | Category: ${player.playerCategory}`, {
                            x: baseX + 50,
                            y: y - 15,
                            size: 10,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });

                        page.drawText(`Email: ${player.email} | Phone: ${player.contactNumber} | CricID: ${cricId}`, {
                            x: baseX + 50,
                            y: y - 30,
                            size: 9,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });
                    }
                }

                const pdfBytes = await pdfDoc.save();
                resolve(Buffer.from(pdfBytes));
            } catch (error) {
                reject(error);
            }
        });
    },


    downloadTournamentTeam: (tournamentId) => {

        return new Promise(async (resolve, reject) => {

            try {


                const teams = await TournamentTeams.aggregate([

                    {
                        $match: { tournament: new mongoose.Types.ObjectId(tournamentId) }
                    },
                    {
                        $lookup: {
                            from: "teams",
                            localField: 'team',
                            foreignField: '_id',
                            as: 'teamDetails'
                        }
                    },
                    {
                        $unwind: "$teamDetails"
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: 'teamDetails.manager',
                            foreignField: '_id',
                            as: 'teamDetails.manager'
                        }
                    },
                    {
                        $unwind: "$teamDetails.manager"
                    },
                    {
                        $project: {
                            _id: 0,
                            teamId: 1,
                            name: '$teamDetails.name',
                            location: '$teamDetails.location',
                            logoUrl: '$teamDetails.logoUrl',
                            phoneNumber: '$teamDetails.phoneNumber',
                            email: '$teamDetails.email',
                            manager: '$teamDetails.manager.fullName'

                        }
                    }
                ])

console.log("teams",teams)
                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const usersPerPage = 10;
                const totalPages = Math.ceil(teams.length / usersPerPage);
                const pageSize = { width: 595.28, height: 841.89 }; // A4

                for (let i = 0; i < totalPages; i++) {
                    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
                    const { width, height } = page.getSize();

                    // Page Title
                    page.drawText(`Tournament teams - Page ${i + 1}`, {
                        x: 50,
                        y: height - 50,
                        size: 16,
                        font,
                        color: rgb(0, 0, 0.6),
                    });

                    const startY = height - 80;
                    const rowHeight = 70;
                    const baseX = 50;

                    const slice = teams.slice(i * usersPerPage, (i + 1) * usersPerPage);
                    for (const [index, team] of slice.entries()) {
                        const y = startY - index * rowHeight;

                        // Card-like background
                        page.drawRectangle({
                            x: baseX - 10,
                            y: y - 35,
                            width: 500,
                            height: 50,
                            color: rgb(0.95, 0.95, 1),
                            borderColor: rgb(0.6, 0.6, 0.6),
                            borderWidth: 0.5,
                        });

                        // --- Add team image from local folder ---
                        if (team.logoUrl) {
                            try {

                                const imageUrl = `${process.env.BASE_URL}/media/${team.logoUrl}`;
                                console.log("Image URL:", imageUrl);

                                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                const imageBuffer = response.data;

                                let imageEmbed;

                                if (team.logoUrl.toLowerCase().endsWith('.png')) {
                                    imageEmbed = await pdfDoc.embedPng(imageBuffer);
                                } else if (team.logoUrl.toLowerCase().endsWith('.jpg') || team.logoUrl.toLowerCase().endsWith('.jpeg')) {
                                    imageEmbed = await pdfDoc.embedJpg(imageBuffer);
                                }
                                else {
                                    imageEmbed = await pdfDoc.embedJpg(imageBuffer);
                                }
                                page.drawImage(imageEmbed, {
                                    x: baseX,
                                    y: y - 30,
                                    width: 40,
                                    height: 40,
                                });
                            } catch (imgErr) {
                                // Ignore image errors, continue
                            }
                        }




                        // --- End image ---

                        const name = `${team.name}`;
                        const teamId = team.teamId || "N/A";
                        const location = team.location || "N/A";
                        const phoneNumber = team.phoneNumber || "N/A";
                        const email = team.email || "N/A";
                        const manager = team.manager || "N/A";


                        page.drawText(`${index + 1 + i * usersPerPage}. ${name}`, {
                            x: baseX + 50, // Shift right to make space for image
                            y: y,
                            size: 12,
                            font,
                            color: rgb(0.1, 0.2, 0.6),
                        });

                        page.drawText(`Manager: ${manager} | Location: ${location}`, {
                            x: baseX + 50,
                            y: y - 15,
                            size: 10,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });

                        page.drawText(`Email: ${email} | Phone: ${phoneNumber} | Team ID: ${teamId}`, {
                            x: baseX + 50,
                            y: y - 30,
                            size: 9,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });
                    }
                }

                const pdfBytes = await pdfDoc.save();
                resolve(Buffer.from(pdfBytes));






            } catch (error) {
                console.error("Error in downloadTournamentTeam:", error);
                reject(error);

            }


        })
    }


}