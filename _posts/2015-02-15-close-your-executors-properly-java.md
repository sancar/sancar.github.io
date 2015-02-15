---
layout: post
title:  "Close your executors properly in java"
date:   2015-02-15
---

I would like to share something new for me related to java.util.concurrent.ExecutorService.
I learned this while I was working on a [bug fix](https://github.com/hazelcast/hazelcast/pull/4599/files#diff-cb6fbd3eea8efacdb3acd75f97565640) at hazelcast.

I will try to explain this in three parts : some background on related architecture, the problem and the solution.

### Related Architecture

We have an executor service that we offload some internal work.

    ExecutorService executor = new ThreadPoolExecutor(executorPoolSize,
                      executorPoolSize, 0L, TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<Runnable>(),
                    /..../ );


At shutdown of hazelcast, we used to call shutdownNow as follows:

    public void shutdown() {
          //...
          executor.shutdownNow();
          //...
      }


And an innocent attempt to detect executor shutdown:

    public Future aUserOperation(){
      Future future = //....

      try {
        executionService.execute( internalRunnable );
      } catch (RejectedExecutionException e) {
        future.set(e);//A future that user thread is waiting on
      }
    }


User calls `aUserOperation` and waits on returned `Future`. Internal runnable will set the response if it runs.

Our aim is either set a response to users future, or set an exception if it fails to run.

## Problem

While user waiting on `future`, someone else calls `shutdown`. Because of that and a bug, our user could not get any response. Therefore, user threads hangs forever without any clue.

## Solution

The problem occurs because we do not close the executor properly.

    public void shutdown() {
          //...
          executor.shutdownNow();
          //...
      }

`shutdownNow` tries to close currently running runnables via `Thread.interrupt`. (Note that runnables are also responsible for setting a response the future in case of interrupt). In our case, problem occurs for runnables that do not event start to run yet. These runnables waiting on a queue inside `executor` . When `shutdownNow` is called these runnables are returned by this method, but they never run. And note that `aUserOperation` is not aware of that because it already send the runnable and did not get any exception. There are different approches that you can take to solve the problem.

### Approach one

If your resources are still available when shutdown method is called, you can choose to run the runnables in shutdown method. This way user operations will be completed and user will get the response.

    public void shutdown() {
        List<Runnable> runnables = executorService.shutdownNow();
        for (Runnable runnable : runnables) {
            runnable.run();
        }
    }

### Approach two

You can choose to call `shutdown` method of executor service. After this method is called, executor runs every runnable it accepted so far, but does not accept new ones. It throws `RejectedExecutionException` for new ones, in which we set the exception to user. [see `aUserOperation`](#related-architecture).

    public void shutdown() {
        executorService.shutdown();
    }

Note that shutdown method is not a blocking call. If you want to make sure that shutdown waits for all runnables to finish you need to use `awaitTermination` method of executor. And this is sort of how I end up with in my [bug fix](https://github.com/hazelcast/hazelcast/pull/4599/files#diff-cb6fbd3eea8efacdb3acd75f97565640).

    public void shutdown() {
      executorService.shutdown();
       try {
           boolean success = executorService.awaitTermination(30, TimeUnit.SECONDS);
           if (!success) {
               // A friendly log:
               // Some operations fail to finish
               // in 30 seconds in graceful shutdown.
           }
       } catch (InterruptedException e) {
         // A friendly log:
         // Hazelcast executor service is interrupted.
         // There are unfinished jobs still running.
       }
    }

A "reasonable" timeout is given to `awaitTermination` to prevent an infinite wait on shutdown. This is a precaution if a bug in one of the runnables causes that thread to stay alive forover. And a second warning in case of InterruptedException which happens if another thread interrupts `awaitTermination`.
