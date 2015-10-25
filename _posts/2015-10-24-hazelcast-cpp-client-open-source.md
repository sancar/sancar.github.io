---
layout: post
title:  "Hazelcast C++ Client Is Now Open Source"
date:   2015-10-24
---

I am happy announce that Hazelcast C++ Client is now open source. We have been developing Hazelcast quite some time as open source. There was already open source java client. And this week company decided to open source two other clients as well, C++ and C# Client. As the one who build the C++ Client from ground, I can`t highlight enough how excited I am. I am waiting for your feedbacks, issues, pull requests and questions. Link to our repository is can be found [here](https://github.com/hazelcast/hazelcast-cpp-client)
And for your questions and feedbacks, you can use our mailing list. [https://groups.google.com/forum/#!forum/hazelcast](https://groups.google.com/forum/#!forum/hazelcast)

Enough with the chit chat, lets talk about what is hazelcast and what we can do with this new shiny open source C++ client.
Here is a short description:
Hazelcast is distributed in-memory data grid. You can distribute your data among your servers with well known data structures like
Map, Queue, List, Set etc. Hazelcast will take care of distribution of data, fail over for you. You can use the hazelcast servers embedded in your application, but today we are going to talk about how to use a simple C++ Client. If you want to know about all features of Hazelcast visit our [documentation page](http://docs.hazelcast.org/docs/3.5/manual/html-single/).

## How to build C++ Client

For C++ client, I would like to show how to build it yourself. Note that I will describe how to build it on linux and mac. If you want an introduction for windows please leave a comment so that I will know that I should write another blog :). You need to have git, cmake(at least 3.1) and a c++ compiler already installed on your pc. First clone the hazelcast-cpp-client via git.

    git clone https://github.com/hazelcast/hazelcast-cpp-client

Than, we will go to root, create a build directory and run cmake on the directory.

    cd hazelcast-cpp-client
    cd mkdir
    cmake ..

For further options like 32/64 bit, dymanic/static lib , you can check out README file in our [repo](https://github.com/hazelcast/hazelcast-cpp-client).

And to start compilation, we will run `make`. I suggest using -j option to make it faster.

  make -j

Now, you should have a library in current directory with name libHazelcastClient[VERSION].a

## Lets write our first C++ Client

Here is sample code for c++ client. It will first check if there is already data on the server,
if not it will put new entry to map. Just to be able to show off ;) .


    #include <iostream>
    #include "hazelcast/client/HazelcastAll.h"
    using namespace hazelcast::client;

    int main(){
        ClientConfig clientConfig;
        HazelcastClient client(clientConfig);

        IMap<int , std::string> map = client.getMap<int , std::string >("myMap");

        boost::shared_ptr<std::string> value = map.get(1);

        if(value != NULL){
            std::cout << " Value stored in the server " << *value << std::endl;
        } else {
            std::cout << "Putting value to map " << std::endl;
            map.put(1, "Hello Open Source Community!!!");
        }
        return 0;
    }


And compile it using following command:


    g++ cppClient.cpp -I[PATH_TO_REPO]/hazelcast/include -I[PATH_TO_REPO]]external/include [PATH_TO_REPO]/build/libHazelcastClient[VERSION].a  -o cppClient


## Lets Run A Sample Test

As starter we need a couple of servers running.

First download our latest release hazelcast-3.6-EA from our website

http://hazelcast.org/download/

After downloading the server, unzip the bundle and go to `bin` directory. And run the server.sh

    sh bin/server.sh

You can fire as many of them as you want from your machine. They will find each other and form a cluster.

And now, we can run our c++ client.

    cppClient

Here is the sample logs from my machine in the first run.


    Oct 24, 2015 05:49:05 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent STARTING
    Oct 24, 2015 05:49:05 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] Connected to Address[localhost:5701] with socket id 4 as the owner connection.
    Oct 24, 2015 05:49:05 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] client authenticated by 192.168.1.2:5701
    Oct 24, 2015 05:49:05 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] LifecycleService::LifecycleEvent CLIENT_CONNECTED
    Oct 24, 2015 05:49:05 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024]
    Members [1]  {
        Member[Address[192.168.1.2:5701]]
    }

    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] Connected to Address[192.168.1.2:5701] with socket id 9.
    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] client authenticated by 192.168.1.2:5701
    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent STARTED
    Putting value to map
    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent SHUTTING_DOWN
    Oct 24, 2015 05:49:06 PM WARNING: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] Closing connection to Address[192.168.1.2:5701] with socket id 4 as the owner connection.
    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] LifecycleService::LifecycleEvent CLIENT_DISCONNECTED
    Oct 24, 2015 05:49:06 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent SHUTDOWN

As you can see, client is started, find cluster , said `Putting value to map` and shutdown. Now, in the second run we should see there is already data in the server.

    Oct 24, 2015 05:52:59 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent STARTING
    Oct 24, 2015 05:52:59 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] Connected to Address[localhost:5701] with socket id 4 as the owner connection.
    Oct 24, 2015 05:52:59 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] client authenticated by 192.168.1.2:5701
    Oct 24, 2015 05:52:59 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] LifecycleService::LifecycleEvent CLIENT_CONNECTED
    Oct 24, 2015 05:52:59 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024]
    Members [1]  {
        Member[Address[192.168.1.2:5701]]
    }

    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] Connected to Address[192.168.1.2:5701] with socket id 9.
    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] client authenticated by 192.168.1.2:5701
    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent STARTED
     Value stored in the server Hello Open Source Community.
    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent SHUTTING_DOWN
    Oct 24, 2015 05:53:00 PM WARNING: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] Closing connection to Address[192.168.1.2:5701] with socket id 4 as the owner connection.
    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [123145304449024] LifecycleService::LifecycleEvent CLIENT_DISCONNECTED
    Oct 24, 2015 05:53:00 PM INFO: [HazelcastCppClient3.7-SNAPSHOTSNAPSHOT] [dev] [140735269326848] LifecycleService::LifecycleEvent SHUTDOWN


Do not forget, we are waiting for your feedbacks, questions and pull requests.

[https://groups.google.com/forum/#!forum/hazelcast](https://groups.google.com/forum/#!forum/hazelcast)

[https://github.com/hazelcast/hazelcast-cpp-client](https://github.com/hazelcast/hazelcast-cpp-client)
