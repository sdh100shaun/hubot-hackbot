import { expect } from 'chai'
import * as sinon from 'sinon'
import { RobotWithClient } from '../hackbot'
import { SlackBotClient } from 'hubot-slack'
import { MemoryDataStore, User } from '@slack/client'
import * as Helper from 'hubot-test-helper'

describe('@hubot add @username to my team', () => {

  let helper: Helper.Helper
  let room: Helper.Room
  let robot: RobotWithClient
  let dataStore: MemoryDataStore

  before(() => helper = new Helper('../index.js'))

  function setUp() {
    room = helper.createRoom()
    robot = <RobotWithClient> room.robot
    dataStore = new MemoryDataStore()
    robot.adapter.client = <SlackBotClient> { rtm: { dataStore: dataStore } }
  }

  function tearDown() {
    room.destroy()
  }

  describe('when in a team', () => {

    before(setUp)
    after(tearDown)

    let userName: string
    let userEmail: string
    let otherUserId: string
    let otherUserUsername: string
    let existingTeamId: string
    let existingTeamName: string
    let getUserStub: sinon.SinonStub
    let addUserToTeamStub: sinon.SinonStub

    before(() => {
      userName = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'abcdefghijklmnopqrstuvwxyz.-_0123456789'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser')
      getUserStub
        .withArgs(userName)
        .returns(Promise.resolve({
          ok: true,
          user: {
            team: {
              id: existingTeamId,
              name: existingTeamName,
            },
          },
        }))

      getUserStub
        .withArgs(otherUserId)
        .returns(Promise.resolve({
          ok: true,
          statusCode: 200,
        }))

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({ ok: true }))

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User)
      sinon.stub(dataStore, 'getUserByName')
        .withArgs(otherUserUsername)
        .returns({ id: otherUserId, name: otherUserUsername } as User)

      return room.user.say(userName, `@hubot add @${otherUserUsername}   to my team`)
    })

    it('should get the current user', () => {
      expect(getUserStub).to.have.been.calledWith(userName)
    })

    it('should get the other user', () => {
      expect(getUserStub).to.have.been.calledWith(otherUserId)
    })

    it('should add the other user to the team', () => {
      expect(addUserToTeamStub).to.have.been.calledWith(existingTeamId, otherUserId, userEmail)
    })

    it('should tell the user that the command has completed', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot add @${otherUserUsername}   to my team`],
        ['hubot', `@${userName} Done!`],
      ])
    })
  })

  describe('when not an attendee', () => {

    before(setUp)
    after(tearDown)

    let userName: string
    let otherUserUsername: string

    before(() => {
      userName = 'micah'
      const userEmail = 'micah.micah~micah'
      const otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      const existingTeamId = 'ocean-mongrels'
      const existingTeamName = 'Ocean Mongrels'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }))

      sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }))

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User)
      sinon.stub(dataStore, 'getUserByName')
        .withArgs(otherUserUsername)
        .returns({ id: otherUserId, name: otherUserUsername } as User)

      return room.user.say(userName, `@hubot add @${otherUserUsername} to my team`)
    })

    it('should tell the user that they do not have permission', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userName} Sorry, you don't have permission to add people to your team.`],
      ])
    })
  })

  describe('when not in a team', () => {

    before(setUp)
    after(tearDown)

    let userName: string
    let otherUserUsername: string

    before(() => {
      userName = 'micah'
      otherUserUsername = 'pollygrafanaasa'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {},
        },
      }))

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName } as User)

      return room.user.say(userName, `@hubot add @${otherUserUsername} to my team`)
    })

    it('shouldtell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userName} I would, but you're not in a team...`],
      ])
    })
  })

  describe('when user is not already a member', () => {

    before(setUp)
    after(tearDown)

    let userName: string
    let userEmail: string
    let otherUserId: string
    let otherUserUsername: string
    let existingTeamId: string
    let existingTeamName: string
    let getUserStub: sinon.SinonStub
    let createUserStub: sinon.SinonStub
    let addUserToTeamStub: sinon.SinonStub

    before(() => {
      userName = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser')
      getUserStub.withArgs(userName).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }))

      getUserStub.withArgs(otherUserId).returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }))

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true }))
      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({ ok: true }))

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User)
      sinon.stub(dataStore, 'getUserByName')
        .withArgs(otherUserUsername)
        .returns({ id: otherUserId, name: otherUserUsername } as User)

      return room.user.say(userName, `@hubot add @${otherUserUsername} to my team`)
    })

    it('should get the current user', () => {
      expect(getUserStub).to.have.been.calledWith(userName)
    })

    it('should get the other user', () => {
      expect(getUserStub).to.have.been.calledWith(otherUserId)
    })

    it('should create the other user', () => {
      expect(createUserStub).to.have.been.calledWith(otherUserId, otherUserUsername, userEmail)
    })

    it('should add the other user to the team', () => {
      expect(addUserToTeamStub).to.have.been.calledWith(existingTeamId, otherUserId, userEmail)
    })

    it('should tell the user that the command has completed', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userName} Done!`],
      ])
    })
  })

  describe('when other user already in a team', () => {

    before(setUp)
    after(tearDown)

    let userName: string
    let otherUserUsername: string

    before(() => {
      userName = 'micah'
      const userEmail = 'micah.micah~micah'
      const otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      const existingTeamId = 'ocean-mongrels'
      const existingTeamName = 'Ocean Mongrels'

      const getUserStub = sinon.stub(robot.client, 'getUser')
      getUserStub.withArgs(userName).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }))

      getUserStub.withArgs(otherUserId).returns(Promise.resolve({
        ok: true,
        statusCode: 200,
      }))

      sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 400,
      }))

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User)
      sinon.stub(dataStore, 'getUserByName')
        .withArgs(otherUserUsername)
        .returns({ id: otherUserId, name: otherUserUsername } as User)

      return room.user.say(userName, `@hubot add @${otherUserUsername} to my team`)
    })

    it('should tell the user that the other user may already be in a team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userName} Sorry, ${otherUserUsername} is already in another team and must leave that team first.`],
      ])
    })
  })

})
