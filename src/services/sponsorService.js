const Tournament = require("../models/Tournament");
const Sponsor = require("../models/Sponsor");

class SponsorService {

  async createSponsor(sponsorData, tournamentId) {
    console.log("create sponsor", sponsorData, tournamentId);
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }
    const sponsor = new Sponsor({
      ...sponsorData,
      tournament: tournament._id,
    });
    await sponsor.save();
    return sponsor;
  }

  async getSponsorsByTournamentId(tournamentId, page = 1, limit = 10, search = "") {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError("Tournament not found");
    }
    const query = { tournament: tournament._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }
    const sponsors = await Sponsor.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Sponsor.countDocuments(query);
    return {
      sponsors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateSponsor(sponsorId, sponsorData) {
    const sponsor = await Sponsor.findByIdAndUpdate(sponsorId, sponsorData, { new: true });
    if (!sponsor) {
      throw new NotFoundError("Sponsor not found");
    }
    return sponsor;
  }

  async deleteSponsor(sponsorId) {
    const sponsor = await Sponsor.findById(sponsorId);
    if (!sponsor) {
      throw new NotFoundError("Sponsor not found");
    }
    await Sponsor.findByIdAndDelete(sponsorId);
  }
}

module.exports = new SponsorService();
