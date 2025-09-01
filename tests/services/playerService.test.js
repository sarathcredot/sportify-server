// npm test -- tests/services/playerService.test.js
const playerService = require('../../src/services/playerService');
const Tournament = require('../../src/models/Tournament');
const TournamentTeams = require('../../src/models/TournamentTeams');
const Squad = require('../../src/models/Squad');
const TeamManagerPlayer = require('../../src/models/TeamManagerPlayer');
const { NotFoundError } = require('../../src/utils/errors');
const { TEAM_STATUS } = require('../../src/utils/constants');

// Mock the models
jest.mock('../../src/models/Tournament');
jest.mock('../../src/models/TournamentTeams');
jest.mock('../../src/models/Squad');
jest.mock('../../src/models/TeamManagerPlayer');

describe('PlayerService - getSquadPlayersByTournament', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when tournament does not exist', () => {
    it('should throw NotFoundError', async () => {
      // Arrange
      const tournamentId = 'nonexistent-tournament-id';
      Tournament.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(playerService.getSquadPlayersByTournament(tournamentId))
        .rejects
        .toThrow(NotFoundError);
      
      expect(Tournament.findById).toHaveBeenCalledWith(tournamentId);
    });
  });

  describe('when tournament exists but has no approved teams', () => {
    it('should return empty players array', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result).toEqual({
        players: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 100,
          pages: 0
        }
      });

      expect(TournamentTeams.find).toHaveBeenCalledWith({
        tournament: tournamentId,
        status: TEAM_STATUS.APPROVED
      });
    });
  });

  describe('when tournament has approved teams but no squads', () => {
    it('should return empty players array', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      const mockApprovedTeams = [
        { _id: 'team1', squad: null },
        { _id: 'team2', squad: undefined }
      ];
      
      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result).toEqual({
        players: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 100,
          pages: 0
        }
      });
    });
  });

  describe('when tournament has approved teams with squads and players', () => {
    it('should return formatted players data with calculated age', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'John Manager',
        email: 'john@example.com'
      };

      const mockPlayer1 = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: new Date('1995-01-01'),
        notes: 'Great player',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const mockPlayer2 = {
        _id: 'player2',
        fullName: 'Jane Smith',
        position: 'Midfielder',
        photoUrl: 'photo2.jpg',
        dateOfBirth: new Date('1990-06-15'),
        notes: 'Experienced player',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer1, mockPlayer2],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.players[0]).toEqual({
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        age: expect.any(Number), // Age should be calculated
        notes: 'Great player',
        squadName: 'Team Alpha',
        squadId: 'squad1',
        teamManager: {
          _id: 'manager1',
          fullName: 'John Manager',
          email: 'john@example.com'
        },
        createdAt: mockPlayer1.createdAt,
        updatedAt: mockPlayer1.updatedAt
      });

      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 2,
        pages: 1
      });

      // Verify age calculation (approximately)
      const expectedAge1 = Math.floor((new Date() - new Date('1995-01-01')) / (365.25 * 24 * 60 * 60 * 1000));
      expect(result.players[0].age).toBe(expectedAge1);
    });
  });

  describe('when search parameter is provided', () => {
    it('should filter players by fullName', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const search = 'john';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockPlayer1 = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: new Date('1995-01-01'),
        notes: 'Player 1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPlayer2 = {
        _id: 'player2',
        fullName: 'Jane Smith',
        position: 'Midfielder',
        photoUrl: 'photo2.jpg',
        dateOfBirth: new Date('1990-06-15'),
        notes: 'Player 2',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer1, mockPlayer2],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId, search);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0].fullName).toBe('John Doe');
    });

    it('should filter players by position', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const search = 'forward';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockPlayer1 = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: new Date('1995-01-01'),
        notes: 'Player 1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockPlayer2 = {
        _id: 'player2',
        fullName: 'Jane Smith',
        position: 'Midfielder',
        photoUrl: 'photo2.jpg',
        dateOfBirth: new Date('1990-06-15'),
        notes: 'Player 2',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer1, mockPlayer2],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId, search);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0].position).toBe('Forward');
    });

    it('should filter players by squad name', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const search = 'alpha';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockPlayer1 = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: new Date('1995-01-01'),
        notes: 'Player 1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer1],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId, search);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0].squadName).toBe('Team Alpha');
    });
  });

  describe('when handling null/undefined values', () => {
    it('should handle players with missing dateOfBirth', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockPlayer = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: null, // No date of birth
        notes: 'Player without DOB',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0].age).toBeNull();
    });

    it('should handle squad without team manager', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockPlayer = {
        _id: 'player1',
        fullName: 'John Doe',
        position: 'Forward',
        photoUrl: 'photo1.jpg',
        dateOfBirth: new Date('1995-01-01'),
        notes: 'Player',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [mockPlayer],
        teamManager: null // No team manager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0].teamManager).toBeNull();
    });

    it('should handle players with missing optional fields', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockPlayer = {
        _id: 'player1',
        fullName: undefined, // Missing fullName
        position: null, // Missing position
        photoUrl: '', // Empty photoUrl
        dateOfBirth: new Date('1995-01-01'),
        notes: undefined, // Missing notes
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSquad = {
        _id: 'squad1',
        name: undefined, // Missing squad name
        players: [mockPlayer],
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result.players).toHaveLength(1);
      expect(result.players[0]).toEqual({
        _id: 'player1',
        fullName: '',
        position: '',
        photoUrl: '',
        age: expect.any(Number),
        notes: '',
        squadName: '',
        squadId: 'squad1',
        teamManager: {
          _id: 'manager1',
          fullName: 'Manager',
          email: 'manager@example.com'
        },
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt
      });
    });
  });

  describe('when squad has no players', () => {
    it('should return empty players array', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      const mockTeamManager = {
        _id: 'manager1',
        fullName: 'Manager',
        email: 'manager@example.com'
      };

      const mockSquad = {
        _id: 'squad1',
        name: 'Team Alpha',
        players: [], // No players
        teamManager: mockTeamManager
      };

      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });
      Squad.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockSquad])
      });

      // Act
      const result = await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(result.players).toHaveLength(0);
      expect(result.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 0,
        pages: 1
      });
    });
  });

  describe('database query verification', () => {
    it('should call database methods with correct parameters', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      
      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      // Act
      await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(Tournament.findById).toHaveBeenCalledWith(tournamentId);
      expect(TournamentTeams.find).toHaveBeenCalledWith({
        tournament: tournamentId,
        status: TEAM_STATUS.APPROVED
      });
    });

    it('should populate squads correctly when they exist', async () => {
      // Arrange
      const tournamentId = 'tournament-id';
      const mockTournament = { _id: tournamentId, name: 'Test Tournament' };
      const mockApprovedTeams = [
        { _id: 'team1', squad: { _id: 'squad1' } }
      ];

      Tournament.findById.mockResolvedValue(mockTournament);
      TournamentTeams.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockApprovedTeams)
      });

      const mockSquadFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      Squad.find.mockReturnValue(mockSquadFind);

      // Act
      await playerService.getSquadPlayersByTournament(tournamentId);

      // Assert
      expect(Squad.find).toHaveBeenCalledWith({ _id: { $in: ['squad1'] } });
      expect(mockSquadFind.populate).toHaveBeenCalledWith('players');
      expect(mockSquadFind.populate).toHaveBeenCalledWith('teamManager', 'fullName email');
      expect(mockSquadFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
