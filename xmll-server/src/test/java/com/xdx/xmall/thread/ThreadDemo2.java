package com.xdx.xmall.thread;

public class ThreadDemo2 implements Runnable{
    @Override
    public void run() {
        System.out.println("thread running!!!");
    }

    public static void main(String[] args) {
        Thread t = new Thread(new ThreadDemo2());
        t.start();
    }
}
