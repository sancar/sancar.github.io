---
layout: post
title:  "How to tackle segmentation fault or abort in C/C++"
date:   2014-11-08
---

Segmentation fault or abort is a nightmare for c, c++ developers especially
for beginners. Your code is crashing without giving any useful information.
It is saying just one of the following and no more output about what happened.

  * Segmentation fault (core dumped)
  * Aborted (core dumped)

I was used to log all the suspected places to figure out which code last executed,
which method is the one causing problems. Fortunately, there is a quicker
solution to find problematic method with the power of signal handlers and
backtrace magic.

Here is sample code which will print stack trace when executed because of a segmentation fault.

    #include <stdio.h>
    #include <execinfo.h>
    #include <signal.h>
    #include <stdlib.h>
    #include <unistd.h>

    void handler(int sig) {
      size_t nStackTraces = 20; //number of backtraces you want at most
      void *array[nStackTraces];
      size_t size;
      //fills array and returns actual number of backtraces at the moment
      size = backtrace(array, nStackTraces);
      printf("signal no %d \n", sig);

      //prints array to std error after converting array to
      //human-readable strings
      backtrace_symbols_fd(array, size, STDERR_FILENO);
      exit(0);
    }

    int function1(){
       int *myUninitiliazedPointer = 0;
       *myUninitiliazedPointer = 1; //opps here comes segmentation fault
       return 0;
    }

    void function0(){
      function1();
    }

    int main() {
        signal(SIGSEGV , handler);   // register our handler
        function0();
        return 0;
    }

You can comment out first line to see our beloved segmentation fault :( .

    Segmentation fault (core dumped)

It is output in my linux :

    signal no 11
    ./a.out[0x4008b5]
    /lib/x86_64-linux-gnu/libc.so.6(+0x36ff0)[0x7f8ac8b33ff0]
    ./a.out[0x40090d]
    ./a.out[0x400923]
    ./a.out[0x40094c]
    /lib/x86_64-linux-gnu/libc.so.6(__libc_start_main+0xf5)[0x7f8ac8b1ede5]
    ./a.out[0x400759]

Which is not very helpful. It seems to get more meaningful output,
one needs to compile its code with -g -rdynamic flags.

    gcc -g -rdynamic sampleCode.c

After that its output changes to:

    ./a.out(_Z7handleri+0x98)[0x400b05]
    /lib/x86_64-linux-gnu/libc.so.6(+0x36ff0)[0x7f7c96c2fff0]
    ./a.out(_Z9function1v+0x10)[0x400b5d]
    ./a.out(_Z9function0v+0x9)[0x400b73]
    ./a.out(main+0x27)[0x400b9c]
    /lib/x86_64-linux-gnu/libc.so.6(__libc_start_main+0xf5)[0x7f7c96c1ade5]
    ./a.out[0x4009a9]

From bottom to top you can see that main called function0, and function0 called function1.
In function1, since it is trying to write to an illegal address, it is raising a segmentation fault signal.
We can even see our handler function called at the top.

We registered a handler for just SIGSEGV which is segmentation fault. To catch "Aborted (core dumped)."
You need to register SIGABRT. You can register same handler function to more than one signal.

There are more signals which can be fired for default libraries. You can check them from
[cpluspus.com](  http://www.cplusplus.com/reference/csignal/)

And for more information about how we get stack trace. Just type following in your command line:

    man backtrace

Note that this method is working with a little bit different outputs for linux and mac os environments.
I did not try Windows. Not sure if these libraries and backtrace method is available in Windows.

I hope this is helpful to you.
