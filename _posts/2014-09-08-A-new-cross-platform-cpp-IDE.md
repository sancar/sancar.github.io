---
layout: post
title:  "A new cross platform cpp IDE"
date:   2014-09-08
---

Today Jetbrains announced EAP with a
[blog post](http://blog.jetbrains.com/clion/2014/09/05/clion-brand-new-ide-for-c-and-c-developers/)
for their new shiny C/C++ IDE. Lets try it.

C-lion name sea lion logo , I see what you did there ;).

I am a fan of jetbeans. I am using intellij idea for java and I was using
AppCode for C++ development. Appcode is also a jetbrains product. It is originally
for objective-c but it also supports C++/C. But it has some problems with C++.
Here is some problems with it before we look into new product:

* It sometimes had problems with finding where a method is used.

* It is based on XCode. Although it enables to make detailed configurations
from Xcode UI, it makes the IDE only available on Mac. Which is a bummer, since
I need IDE for my linux and windows environment too.

* It has a weird default behaviour when generating methods like getters and setters
or when overriding methods. Even tough I try to generate the getter and setter in source file,
it insists on generating them in header files. And sometimes it puts the generated
code in wrong place and code ends up in a non compilable state.

* Although version control support was working fine with a straight forward Xcode project, when
I switch to CMake generated Xcode project, VCS failed to work. At the end, I could not integrate it properly
wit CMake.

Lets see how C-lion is doing compared to these. First successes:

* It has builtin CMake support. A huge plus for me since I am using CMake with my projects. I just opened a new project
with my CMakeLists.txt and it works.

* It is cross platform. It means I can work with one IDE in mac, linux and Windows. Or am I? I need to test this on
my Windows machine. I will update this part when I did.

* Github integration is working fine out of the box.

* It has all the shortcuts as a usual Jetbrains product does.

Now failures:

* It still has same weird behaviour when I try to generate methods in source file.

* It still has problems for finding references. It looks like problem related to templated classes.

Project seems promising. Since they are in Early Access stage, I am sure that problems will be fixed.
I better take visit to their [issue tracker](http://youtrack.jetbrains.com/issues/CPP).
