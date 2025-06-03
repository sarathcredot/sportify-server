

const Players = require('../models/Player');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
module.exports = {


    downloadTournamentPlayers: () => {

        return new Promise(async (resolve, reject) => {
            try {

                const players = await Players.find().lean();
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
                    slice.forEach((player, index) => {
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

                        const fullName = `${player.firstName} ${player.lastName}`;
                        const dateOfBirth = new Date(player.dateOfBirth).toLocaleDateString();
                        const cricId = player.cricHeroesId || "N/A";

                        

                        page.drawText(`${index + 1 + i * usersPerPage}. ${fullName} (${player.sport})`, {
                            x: baseX,
                            y: y,
                            size: 12,
                            font,
                            color: rgb(0.1, 0.2, 0.6),
                        });

                        page.drawText(`DOB: ${dateOfBirth} | Category: ${player.playerCategory}`, {
                            x: baseX,
                            y: y - 15,
                            size: 10,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });

                        page.drawText(`Email: ${player.email} | Phone: ${player.contactNumber} | CricID: ${cricId}`, {
                            x: baseX,
                            y: y - 30,
                            size: 9,
                            font,
                            color: rgb(0.2, 0.2, 0.2),
                        });
                    });
                }

                const pdfBytes = await pdfDoc.save();
                resolve(Buffer.from(pdfBytes));


            } catch (error) {
               
               
                reject(error);


            }
        });

    }
}