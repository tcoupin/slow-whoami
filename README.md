# slow-whoami

- http://127.0.0.1/: GUI
- http://127.0.0.1/dashboard/: Traefik GUI
- http://127.0.0.1/ping: print hostname (container id??) and http headers.
- http://127.0.0.1/localstats: print single host stats
- http://127.0.0.1/stats: print global stats

[![Try in PWD](https://github.com/play-with-docker/stacks/raw/cff22438cb4195ace27f9b15784bbb497047afa7/assets/images/button.png)](http://play-with-docker.com/?stack=https://raw.githubusercontent.com/tcoupin/slow-whoami/master/docker-compose.yml)

## 3 docker-compose files

- [docker-compose.yml](docker-compose.yml) : only the slow-whoami application. Not scalable with docker-compose, scalable with docker swarm
- [docker-compose.lb.yml](docker-compose.lb.yml) : slow-whoami + traefik load-balancer for docker-compose : scalable
- [docker-compose.swarmlb.yml](docker-compose.swarmlb.yml) : slow-whoami + traefik load-balancer for docker swarm : scalable


| | Work with compose | Scalable with compose | Work with swarm | Scalable with swarm |
| --- | :---: | :---: | :---: | :---: |
| **docker-compose.yml** | Yes | No | Yes | Yes |
| **docker-compose.lb.yml** | Yes | Yes | No | - |
| **docker-compose.swarmlb.yml** | No | - | Yes | Yes |
