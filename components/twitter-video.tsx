"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
    interface Window {
        twttr: {
            widgets: {
                load: () => void;
            };
        };
    }
}

export function TwitterVideo() {
    useEffect(() => {
        // Load widgets after script is loaded
        if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
        }
    }, []);

    return (
        <>
            <Script
                src="https://platform.twitter.com/widgets.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.twttr && window.twttr.widgets) {
                        window.twttr.widgets.load();
                    }
                }}
            />
            <div className="flex justify-center">
                <blockquote
                    className="twitter-tweet"
                    data-media-max-width="560"
                    data-theme="dark"
                >
                    <p lang="en" dir="ltr">
                        this is how multi-tool orchestration works in Continuum to handle
                        complex task from your slack workspace in just a few seconds!
                        <br />
                        <br />
                        6 isolated instructions, few seconds, one command.
                        <br />
                        <br />
                        a killer performance boost for your team's productivity.
                        <a href="https://twitter.com/hashtag/BuildInPublic?src=hash&amp;ref_src=twsrc%5Etfw">
                            #BuildInPublic
                        </a>{" "}
                        <a href="https://t.co/uAK6kfIJ49">pic.twitter.com/uAK6kfIJ49</a>
                    </p>
                    &mdash; Avyukt Soni (@avyukt_soni){" "}
                    <a href="https://twitter.com/avyukt_soni/status/2012132604892602411?ref_src=twsrc%5Etfw">
                        January 16, 2026
                    </a>
                </blockquote>
            </div>
        </>
    );
}
