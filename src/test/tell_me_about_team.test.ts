import { expect } from 'chai'
import * as sinon from 'sinon'
import { RobotWithClient } from '../hackbot'
import * as Helper from 'hubot-test-helper'

describe('@hubot tell me about team X', () => {

  let helper: Helper.Helper
  let room: Helper.Room
  let robot: RobotWithClient

  before(() => helper = new Helper('../index.js'))

  function setUp() {
    room = helper.createRoom()
    robot = <RobotWithClient> room.robot
  }

  function tearDown() {
    room.destroy()
  }

  describe('when team exists with members and a motto', () => {

    before(setUp)
    after(tearDown)

    let userId: string
    let teamId: string
    let teamName: string
    let firstTeamMember: string
    let secondTeamMember: string
    let motto: string
    let getTeamStub: sinon.SinonStub

    before(() => {
      userId = 'jerry'
      teamId = 'my-crazy-team-name'
      teamName = 'My Crazy Team Name'
      firstTeamMember = 'Jerry'
      secondTeamMember = 'Bob'
      motto = 'Pikes and spikes hurt on bikes'

      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: true,
        team: {
          id: teamId,
          name: teamName,
          motto: motto,
          members: [{
            name: firstTeamMember,
          }, {
            name: secondTeamMember,
          }],
        },
      }))

      return room.user.say(userId, `@hubot tell me about team     ${teamName}         `)
    })

    it('should fetch the team by slug (teamid)', () => {
      expect(getTeamStub).to.have.been.calledWith(teamId)
    })

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about team     ${teamName}         `],
        ['hubot', `@${userId} "${teamName}" has 2 members: ${firstTeamMember}, ${secondTeamMember}\r\nThey say: ${motto}`],
      ])
    })
  })

  describe('when team exists with one member and no motto', () => {

    before(setUp)
    after(tearDown)

    let userId: string
    let teamName: string
    let teamMember: string
    let getTeamStub: sinon.SinonStub

    before(() => {
      userId = 'megan'
      teamName = 'My Crazy Team Name'
      teamMember = 'John'

      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: true,
        team: {
          name: 'My Crazy Team Name',
          motto: null,
          members: [{
            name: teamMember,
          }],
        },
      }))

      return room.user.say(userId, `@hubot tell me about team     ${teamName}         `)
    })

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about team     ${teamName}         `],
        ['hubot', `@${userId} "${teamName}" has 1 member: ${teamMember}\r\nThey don't yet have a motto!`],
      ])
    })
  })

  describe('when team exists with the user as the only member and a motto', () => {

    before(setUp)
    after(tearDown)

    let userId: string
    let teamName: string
    let motto: string
    let getTeamStub: sinon.SinonStub

    before(() => {
      userId = 'frank'
      teamName = 'My Crazy Team Name'
      motto = 'Hipsters, everywhere!'

      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: true,
        team: {
          name: teamName,
          motto: motto,
          members: [{
            id: userId,
            name: userId,
          }],
        },
      }))

      return room.user.say(userId, `@hubot tell me about team     ${teamName}         `)
    })

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about team     ${teamName}         `],
        ['hubot', `@${userId} You are the only member of "${teamName}" and your motto is: ${motto}`],
      ])
    })
  })

  describe('when team exists with the user as the only member and no motto', () => {

    before(setUp)
    after(tearDown)

    let userId: string
    let teamName: string
    let getTeamStub: sinon.SinonStub

    before(() => {
      userId = 'frank'
      teamName = 'My Crazy Team Name'

      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: true,
        team: {
          name: teamName,
          motto: null,
          members: [{
            id: userId,
            name: userId,
          }],
        },
      }))

      return room.user.say(userId, `@hubot tell me about team     ${teamName}         `)
    })

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about team     ${teamName}         `],
        ['hubot', `@${userId} You are the only member of "${teamName}" and you have not yet set your motto!`],
      ])
    })
  })

  describe('when team exists with no members', () => {

    before(setUp)
    after(tearDown)

    let getTeamStub: sinon.SinonStub

    before(() => {
      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: true,
        team: {
          id: 'my-crazy-team-name',
          name: 'My Crazy Team Name',
          members: [],
        },
      }))

      return room.user.say('sarah', '@hubot tell me about team     my cRAZY team name         ')
    })

    it('should fetch the team by slug (teamid)', () => {
      expect(getTeamStub).to.have.been.calledWith('my-crazy-team-name')
    })

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        ['sarah', '@hubot tell me about team     my cRAZY team name         '],
        ['hubot', '@sarah "My Crazy Team Name" is an empty team.'],
      ])
    })
  })

  describe('when team does not exist', () => {

    before(setUp)
    after(tearDown)

    let getTeamStub: sinon.SinonStub

    before(() => {
      getTeamStub = sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }))

      return room.user.say('sarah', '@hubot tell me about team  :smile:')
    })

    it('should fetch the team by slug (teamid)', () => {
      expect(getTeamStub).to.have.been.calledWith('smile')
    })

    it('should tell the user the team does not exist', () => {
      expect(room.messages).to.eql([
        ['sarah', '@hubot tell me about team  :smile:'],
        ['hubot', "@sarah Sorry, I can't find that team."],
      ])
    })
  })

  describe('when get team fails', () => {

    before(setUp)
    after(tearDown)

    before(() => {
      sinon.stub(robot.client, 'getTeam').returns(Promise.resolve({ ok: false }))

      return room.user.say('sarah', '@hubot tell me about team     my crazy team name         ')
    })

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        ['sarah', '@hubot tell me about team     my crazy team name         '],
        ['hubot', '@sarah Sorry, there was a problem when I tried to look up that team :frowning:'],
      ])
    })
  })
})
