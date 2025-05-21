Here's a bit more about how and why I built this app.

## About This Site
I've had this domain now for quite a while. And every few years, I try to recreate the site with a new theme but also some new tech stack to push and stretch myself a bit.

# Moving to Next.js and Cursor AI
Originally this site and old VPS started as a way to dive deep in Wordpress deployments and learn some new languages like PHP and Python. Then, the site evolved into a Hyde single page app I created from scratch, sitting behind Cloudflare and deployed from Github to an S3 bucket. A few years ago I had switched it off while moving as the S3 charges were quite a lot each month for a hobby site and AWS was the only expense on an old card I wanted to close down.

I decided now with the help of AI tools like Chat GPT, Perplexity and Cursor AI, I could swing a bit higher with this next incaration. I really wanted to dive deep into the tech side of deploying the app in an automated fashion using Github actions. After a short while poking around, I realised that Cursor really wanted to push you in the Next.js direction and so I went for that.

# Making the site more interactive
I didn't like the look and feel of the app, and so I started to think how to make it more interactive and enjoyable to present my social links. As I'm an amateur musician and visual artist, who is always looking for new ways to express myself, I thought about how to show off my portfoloio site as a living portfolio.

I was never a really strong developer, with very little experience in full stack apps, hot new frameworks and the like. However, with Cursor AI and a ton of vibe coding, I wanted to see how far I could take this, all the while maintaining good infrastructure and security practices.

## Deployed on Cloudflare Pages
After battling on an old shared VPS that was too locked down to run node.js, I wanted to revisit an architecture I had played with a while back when deploying Cloudflare Zero Trust (Access) for work and some personal projects. Cloudflare Pages is some tech which has come a really long way in recent years. With help from the likes of Cursor, debugging is still tough if you don't know what you are doing, but it a ton quicker.

This approach closely follows the [Cloudflare Next.js deployment docs](https://developers.cloudflare.com/pages/framework-guides/nextjs/) which has a great connector to tie in to Github. It gave me a chance to set up all my old infra again and dust off all my tech skills to give it a go.

## Keyboard Controls
Below, I'll breakdown some of the controls. If you've visited the site, I think it's pretty intuitive to get started. However, my hope is that it's more like a curiosity for folks to play with and enjoy trying to find more creativity to unlock along the way. If you couldn't guess, there are some key bindings to make things more "playable" almost like a groovebox.

There are a few undocumented Easter Eggs that I'll let you discover by reading through the code or just playing around. And I'm sure I'll come back and add more when I get some free cycles.

```
Usage:

Harmonium:
  1         Play random jazzy chord
  2         Play mysterious/modal chord
  3         Play root major chord
  4         Play ambiguous/modal chord
  5         Play spicy/altered chord

Instruments ("Fidget Spinners"):
  Q W E R T Play melodic tones 
  S         Play bass   
  D         Play ambient pad

Drum Sequencer:
  P         Toggle play/pause
  Space     Tap tempo (hold to pause, release to resume)
  .         Drum roll (hold)
  ,         Randomize pattern
  M         Load a new interesting pattern ("magic")
  Click     First click on a step starts playback

```

I really enjoyed making this project. Both for myself, but also with the thought that others could enjoy this as well. I hope it gives inspiration to others.

-- Andrew