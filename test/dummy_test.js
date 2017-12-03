import nock from 'nock';

const should = require('chai').should();

describe('dummy module', () => {
  describe('dummyfunction', () => {
    afterEach(() => {
      nock.cleanAll();
    });
    it('should do good things', () => {
      (1 === 2).should.equal(false);
    });
  });
});
