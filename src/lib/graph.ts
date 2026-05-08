import { gql, request } from 'graphql-request';
import type { AppConfig } from '../config.js';
import { graphEndpoint } from '../config.js';

const DAO_FIELDS = gql`
  fragment DaoFields on Dao {
    id
    createdAt
    name
    safeAddress
    lootAddress
    sharesAddress
    totalShares
    totalLoot
    proposalCount
    activeMemberCount
    votingPeriod
    gracePeriod
    quorumPercent
    minRetentionPercent
    sponsorThreshold
    newOffering
  }
`;

const PROPOSAL_FIELDS = gql`
  fragment ProposalFields on Proposal {
    id
    proposalId
    createdAt
    createdBy
    sponsored
    sponsoredAt
    sponsor
    processed
    processedAt
    cancelled
    passed
    actionFailed
    votingStarts
    votingEnds
    graceEnds
    expiration
    yesVotes
    noVotes
    proposalData
    details
    title
    description
    proposalType
    contentURI
    contentURIType
  }
`;

const MEMBER_FIELDS = gql`
  fragment MemberFields on Member {
    id
    memberAddress
    shares
    loot
    delegateShares
    delegateOf
    exists
    jailed
    createdAt
  }
`;

export type GraphClient = {
  dao(dao: string): Promise<unknown>;
  proposals(dao: string, first: number, skip: number): Promise<unknown>;
  proposal(dao: string, proposalId: string): Promise<unknown>;
  members(dao: string, first: number, skip: number): Promise<unknown>;
  records(dao: string, table: string, first: number, skip: number): Promise<unknown>;
  query(query: string, variables?: Record<string, unknown>): Promise<unknown>;
};

export function createGraphClient(config: AppConfig): GraphClient {
  const endpoint = () => graphEndpoint(config);

  return {
    async dao(dao) {
      return request(endpoint(), gql`
        ${DAO_FIELDS}
        query Dao($id: ID!) {
          dao(id: $id) {
            ...DaoFields
          }
        }
      `, { id: dao });
    },

    async proposals(dao, first, skip) {
      return request(endpoint(), gql`
        ${PROPOSAL_FIELDS}
        query Proposals($dao: String!, $first: Int!, $skip: Int!) {
          proposals(
            first: $first
            skip: $skip
            orderBy: proposalId
            orderDirection: desc
            where: { dao: $dao }
          ) {
            ...ProposalFields
          }
        }
      `, { dao, first, skip });
    },

    async proposal(dao, proposalId) {
      return request(endpoint(), gql`
        ${PROPOSAL_FIELDS}
        query Proposal($id: ID!) {
          proposal(id: $id) {
            ...ProposalFields
          }
        }
      `, { id: `${dao}-proposal-${proposalId}` });
    },

    async members(dao, first, skip) {
      return request(endpoint(), gql`
        ${MEMBER_FIELDS}
        query Members($dao: String!, $first: Int!, $skip: Int!) {
          members(
            first: $first
            skip: $skip
            orderBy: shares
            orderDirection: desc
            where: { dao: $dao }
          ) {
            ...MemberFields
          }
        }
      `, { dao, first, skip });
    },

    async records(dao, table, first, skip) {
      return request(endpoint(), gql`
        query Records($dao: String!, $table: String!, $first: Int!, $skip: Int!) {
          records(
            first: $first
            skip: $skip
            orderBy: createdAt
            orderDirection: desc
            where: { dao: $dao, table: $table }
          ) {
            id
            createdAt
            createdBy
            tag
            table
            queryType
            contentType
            content
          }
        }
      `, { dao, table, first, skip });
    },

    async query(query, variables) {
      return request(endpoint(), query, variables);
    },
  };
}
