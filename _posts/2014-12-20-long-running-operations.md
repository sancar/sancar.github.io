---
layout: post
title:  "Find out what your long running operations is doing"
date:   2014-12-20
---


We have some interfaces that are implemented by users of
[hazelcast](www.hazelcast.org) . If these operations are blocked
or take long time, it is bad news for hazelcast since it may cause slowdown.
Since we do not know what is going on in these operations, best we can do is warn the user
if operations are taking too long. Additionally, to make the warning more useful we decided that
we should include stack traces of these operations should be in the warning.

In java, it is more or less straight forward if you are used to multi-threading.
But I want to talk about how we can do it in C. Trying to do in java can be a good exercise for you.

I get the idea when I was reading [Antirez weblog](http://antirez.com/news/84) (Blog of the creator of [redis](http://redis.io/)).
He was talking about a watch dog feature to find out what your long operation is up to.
How it is working is not explained in that blog since it is not the main topic. I will get into details how it can be achieved in this
blog.

There is [alarm function](http://linux.die.net/man/2/alarm) which will raise signal after given amount of time.
We will use signal handlers to get the signal and print the stack trace.

We will basically reuse the code in [my previous post](http://sancar.github.io/2014/11/08/how-to-tackle-segmentation-fault-or-abort.html)
to get stack traces. There is one more line at the end of method different from old post, because we want to see print stack trace every 5 seconds.

    void alarmHandler(int sig){

      size_t nStackTraces = 20; //number of backtraces you want at most
      void *array[nStackTraces];
      size_t size;
      //fills array and returns actual number of backtraces at the moment
      size = backtrace(array, nStackTraces);
      printf("signal no %d \n", sig);
      //prints array to std error after converting array to
      //human-readable strings
      backtrace_symbols_fd(array, size, STDERR_FILENO);

      alarm(5); // raise the alarm again after 5 seconds
    }

And we need to have a long running operation. This can be a method that making
calls to kernel or a database in your code. Or it can be an alien code to you that is
implemented by users of your library.

I implemented a sample long running operation as follows:

    void verylongoperation(){
      int i = 0;
      while(i++ < 4){
        sleep(20); //sleep 20 seconds
      }
    }

Now we need to register our alarm handler to correct signal. We will start
alarm to raise signal after 5 seconds before calling our long running operation.
And after that we will close the alarm.

    int main(){
      signal(SIGALRM ,  alarmHandler );
      alarm(5); // raise signal alarm after 5 seconds
      verylongoperation();
      alarm(0); // stop raising alarm signal

      return 0;
    }

You can access to working code from  [my public gist](https://gist.github.com/sancar/8c9cb07b39ad222c87f1).
When we compile and run the code, we get a output as follows:


    signal no 14
    0   a.out                               0x000000010c0f4ddc alarmHandler + 76
    1   libsystem_platform.dylib            0x00007fff8d45af1a _sigtramp + 26
    2   a.out                               0x000000010c0f60b2 main + 4626
    3   libsystem_c.dylib                   0x00007fff8aa6bddd sleep + 42
    4   a.out                               0x000000010c0f4e87 verylongoperation + 71
    5   a.out                               0x000000010c0f4ed6 main + 54
    6   libdyld.dylib                       0x00007fff907855c9 start + 1
    7   ???                                 0x0000000000000001 0x0 + 1
    signal no 14
    0   a.out                               0x000000010c0f4ddc alarmHandler + 76
    1   libsystem_platform.dylib            0x00007fff8d45af1a _sigtramp + 26
    2   a.out                               0x000000010c0f60b2 main + 4626
    3   libsystem_c.dylib                   0x00007fff8aa6bddd sleep + 42
    4   a.out                               0x000000010c0f4e87 verylongoperation + 71
    5   a.out                               0x000000010c0f4ed6 main + 54
    6   libdyld.dylib                       0x00007fff907855c9 start + 1
    7   ???                                 0x0000000000000001 0x0 + 1
    signal no 14
    0   a.out                               0x000000010c0f4ddc alarmHandler + 76
    1   libsystem_platform.dylib            0x00007fff8d45af1a _sigtramp + 26
    2   a.out                               0x000000010c0f60b2 main + 4626
    3   libsystem_c.dylib                   0x00007fff8aa6bddd sleep + 42
    4   a.out                               0x000000010c0f4e87 verylongoperation + 71
    5   a.out                               0x000000010c0f4ed6 main + 54
    6   libdyld.dylib                       0x00007fff907855c9 start + 1
    7   ???                                 0x0000000000000001 0x0 + 1
    signal no 14
    0   a.out                               0x000000010c0f4ddc alarmHandler + 76
    1   libsystem_platform.dylib            0x00007fff8d45af1a _sigtramp + 26
    2   a.out                               0x000000010c0f60b2 main + 4626
    3   libsystem_c.dylib                   0x00007fff8aa6bddd sleep + 42
    4   a.out                               0x000000010c0f4e87 verylongoperation + 71
    5   a.out                               0x000000010c0f4ed6 main + 54
    6   libdyld.dylib                       0x00007fff907855c9 start + 1
    7   ???                                 0x0000000000000001 0x0 + 1

When alarm is raised, operation is interrupted and our method is called. After that it returns back to
doing its job. We can see from here that our code is waiting in sleep call inside 'verylongoperation' function.

Note: Sleep and signals are not working well together. After handler function is called, it is not going back to sleep.
It behaves as if sleep is timed out and continues. Normally we should see 16 stack traces in the output. It sleep 20 seconds at each iteration. There is 4 iterations.
It should take 80 seconds. We are printing every 5 seconds. 80 / 5 = 16 stack traces. But we are making it continue after each 5 seconds by using alarm signal. Hence we end up with only 4 stack traces.
