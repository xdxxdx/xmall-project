package com.xdx.xmall.thread;

public class ThreadDemo extends Thread{
    @Override
    public void run() {
        System.out.println("thread running");
    }

    public static void main(String[] args) {
        ThreadDemo t=new ThreadDemo();
        t.start();
    }
}
