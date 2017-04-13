import { ArgumentNullError, AlreadyInUseError, NotFoundError, ValidationError } from 'common-errors';
import Joi from 'joi';

const HOST_SCHEMA = Joi.object().keys({
  name: Joi.string().alphanum().required(),
}).required();

const LINK_SCHEMA = Joi.object().keys({
  from: Joi.string().alphanum().required(),
  to: Joi.string().alphanum().required(),
  description: Joi.string().alphanum().required(),
}).required();

const Network = function Network() {
  // Hold all host and links in the format
  // this.hosts["host"]["linked host"] = "link discription"
  this.hosts = {};

  // Not required but useful for tests
  this.reset = () => {
    this.hosts = {};
  };

  this.getHosts = () => Object.keys(this.hosts);

  this.getLinks = () => Object.keys(this.hosts).reduce((acc, from) => {
    const edges = Object.keys(this.hosts[from]).map(to => ({
      from,
      to,
      description: this.hosts[from][to],
    }));
    return acc.concat(edges);
  }, []);

  this.addHost = (host) => {
    if (!host) {
      throw new ArgumentNullError('host');
    }

    Joi.validate(host, HOST_SCHEMA, { abortEarly: false }, (err) => {
      if (err) {
        throw new ValidationError(err.details);
      }
      if (this.hosts[host.name]) {
        throw new AlreadyInUseError('host', 'name');
      }
      this.hosts[host.name] = {};
    });
  };

  this.addLink = (link) => {
    if (!link) {
      throw new ArgumentNullError('link');
    }

    Joi.validate(link, LINK_SCHEMA, { abortEarly: false }, (err) => {
      if (err) {
        throw new ValidationError(err.details);
      }
      if (!this.hosts[link.from]) {
        throw new NotFoundError(link.from);
      }
      if (!this.hosts[link.to]) {
        throw new NotFoundError(link.to);
      }
      this.hosts[link.from][link.to] = link.description;
    });
  };

  this.path = (source, target) => {
    if (!source || !target) {
      throw new ArgumentNullError(source ? 'target' : 'source');
    }
    if (!this.hosts[source]) {
      throw new NotFoundError(source);
    }
    if (!this.hosts[target]) {
      throw new NotFoundError(target);
    }

    // BFS from source to target
    const seen = {};
    seen[source] = true;
    const queue = [source];

    while (queue.length) {
      const current = queue.shift();
      if (current === target) {
        break;
      }
      Object.keys(this.hosts[current]).forEach((link) => {
        if (!seen[link]) {
          seen[link] = {
            from: current,
            description: this.hosts[current][link],
          };
          queue.push(link);
        }
      });
    }

    // If we never seen the target there is no path
    if (!seen[target]) {
      return [];
    }

    // Starting at the target work back to the source
    const route = [];
    let current = target;
    while (current !== source) {
      route.push({
        from: seen[current].from,
        to: current,
        description: seen[current].description,
      });
      current = seen[current].from;
    }
    route.reverse();
    return route;
  };
};

export default new Network();
