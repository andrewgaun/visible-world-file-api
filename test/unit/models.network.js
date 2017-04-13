import { expect } from 'chai';
import { ArgumentNullError, AlreadyInUseError, NotFoundError, ValidationError } from 'common-errors';
import network from '../../src/models/network';

beforeEach(() => network.reset());

describe('models/network', () => {
  describe('#addHost(host)', () => {
    it('host param is required', () => {
      expect(network.addHost).to.throw(ArgumentNullError);
    });
    it('host validation', () => {
      expect(network.addHost.bind(network, {})).to.throw(ValidationError);
      expect(network.addHost.bind(network, { name: 'test' })).to.not.throw(ValidationError);
    });
    it('added host should be visible via #getHosts()', () => {
      network.addHost({ name: 'test' });
      expect(network.getHosts()).to.include('test');
    });
    it('duplicate host names are not allowed', () => {
      expect(network.addHost.bind(network, { name: 'test' })).to.not.throw(Error);
      expect(network.getHosts()).to.include('test');
      expect(network.addHost.bind(network, { name: 'test' })).to.throw(AlreadyInUseError);
    });
  });

  describe('#addLink(link)', () => {
    it('link param is required', () => {
      expect(network.addLink).to.throw(ArgumentNullError);
    });
    it('link validation', () => {
      expect(network.addLink.bind(network, {})).to.throw(ValidationError);
      expect(network.addLink.bind(network, { to: 'test', from: 'test2' })).to.throw(ValidationError);
      expect(network.addLink.bind(network, { to: 'test', description: 'ftp' })).to.throw(ValidationError);
      expect(network.addLink.bind(network, { from: 'test2', description: 'ftp' })).to.throw(ValidationError);
      expect(network.addLink.bind(network, { to: 'test', from: 'test2', description: 'ftp' })).to.not.throw(ValidationError);
    });
    it('hosts must be in network before a link can be added', () => {
      expect(network.addLink.bind(network, { from: 'test1', to: 'test2', description: 'ftp' })).to.throw(NotFoundError, /test1/);
      network.addHost({ name: 'test1' });
      expect(network.addLink.bind(network, { from: 'test1', to: 'test2', description: 'ftp' })).to.throw(NotFoundError, /test2/);
      network.addHost({ name: 'test2' });
      expect(network.addLink.bind(network, { from: 'test1', to: 'test2', description: 'ftp' })).to.not.throw(NotFoundError);
    });
    it('added link should be visible via #getLinks()', () => {
      network.addHost({ name: 'test1' });
      network.addHost({ name: 'test2' });
      network.addLink({ from: 'test1', to: 'test2', description: 'ftp' });
      expect(network.getLinks()).to.deep.include({ from: 'test1', to: 'test2', description: 'ftp' });
    });
  });

  describe('#path(source, target)', () => {
    it('undefined nodes should result in error', () => {
      expect(network.path).to.throw(ArgumentNullError);
      expect(network.path.bind(network, 'test')).to.throw(ArgumentNullError);
      expect(network.path.bind(network, undefined, 'test')).to.throw(ArgumentNullError);
    });
    it('not found error if nodes not in network', () => {
      expect(network.path.bind(network, 'test1', 'test2')).to.throw(NotFoundError);
      network.addHost({ name: 'test1' });
      expect(network.path.bind(network, 'test1', 'test2')).to.throw(NotFoundError, /test2/);
      expect(network.path.bind(network, 'test2', 'test1')).to.throw(NotFoundError, /test2/);
    });
    it('should return empty path for unconnected hosts', () => {
      network.addHost({ name: 'test1' });
      network.addHost({ name: 'test2' });
      expect(network.path('test1', 'test2')).to.have.length(0);
    });
    it('should return empty path if to and from are the same', () => {
      network.addHost({ name: 'test1' });
      expect(network.path('test1', 'test1')).to.have.length(0);
    });
    it('should return a path of length 1 for connected hosts', () => {
      network.addHost({ name: 'test1' });
      network.addHost({ name: 'test2' });
      network.addLink({
        to: 'test2',
        description: 'ftp',
        from: 'test1',
      });

      expect(network.path('test1', 'test2')).to.be.lengthOf(1);
    });
    it('API documents sample path', () => {
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(node => network.addHost({ name: node }));

      [
        ['A', 'scp', 'B'],
        ['B', 'ftp', 'C'],
        ['B', 'ftp', 'D'],
        ['C', 'rsync', 'D'],
        ['D', 'samba', 'E'],
        ['F', 'scp', 'G'],
        ['F', 'scp', 'H'],
        ['G', 'rsync', 'H'],
      ].forEach((link) => {
        network.addLink({
          from: link[0],
          description: link[1],
          to: link[2],
        });
      });

      expect(network.path('A', 'D')).to.deep.equal([
        { description: 'scp', to: 'B', from: 'A' },
        { description: 'ftp', to: 'D', from: 'B' },
      ]);
      expect(network.path('A', 'F')).to.have.length(0);
    });
    it('200 host example', () => {
      for (let i = 0; i < 200; i += 1) {
        network.addHost({ name: `${i}` });
      }

      for (let i = 1; i < 200; i += 1) {
        network.addLink({
          from: `${i - 1}`,
          to: `${i}`,
          description: 'short',
        });
      }

      expect(network.path('0', '199')).to.have.length(199);

      for (let i = 10; i < 200; i += 10) {
        network.addLink({
          from: `${i - 10}`,
          to: `${i}`,
          description: 'long',
        });
      }

      const path = network.path('0', '199');
      expect(path.filter(hop => hop.description === 'long')).to.have.length(19);
      expect(path.filter(hop => hop.description === 'short')).to.have.length(9);
    });
  });
});
