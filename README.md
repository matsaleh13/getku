# GetKu

This is a simple script to download my wife's Ku submissions before the app and site goes dark.

## Background

Ku, formerly known as HeyKu, was a very cool little social app for writing and sharing haiku poetry. 
It started out with a small but creative and supportive community. It was a wonderful way to express
creativity and share with like-minded people. Sadly, as it grew, lack of basic moderation and anti-griefing
tools eventually allowed more negative personalities to dominate. Also, the founders of Ku apparently
had no real business plan or plan for monetization. So, eventually lack of funds forced them to 
announce that they'll be sunsetting the product.

This script is my feeble attempt to recover my wife's Ku submissions so she can have them as a 
keepsake for her mostly positive, and sometimes tumultuous, time with Ku.

## Ku API

Ku is an iPhone and Android app, and you can't submit Kus via the web. However, there is a bare-bones REST API
intended for sharing Kus via social media. This is how we'll retrieve the ones we want.

Each person's Ku is assigned an integer ID. The ID only refers to the Ku itself and has no information about the user who submitted it.

To retrieve a formatted page for a given Ku:

`http://kuapp.me/h/<ID>`

The actual content of the Ku poetry submission is an image, not text. This is so that the user can include hand
drawings and custom backgrounds for their poetry. This image is really what we want.

To retrieve the image containing Ku content:

`http://heyku.me/Photos//Heykus//heyku_<ID>.png`

Using this information, we can scrape the entire Ku website for the Kus of a single user, downloading every Ku, looking for ones written by our user,
and then downloading the image for that Ku. Inefficient and heavy-handed? You bet. Effective? Well yes, yes it is.


## Usage

```
  Usage: getku [options]

  Options:

    -h, --help                     output usage information
    -s, --startingNumber <number>  The starting index for Kus to retrieve. Default: 0
    -e, --endingNumber <number>    The ending index for Kus to retrieve. Default: 500000
    -c, --concurrency <number>     Max number of concurrent requests. Default: 10
    -u --user <username>           The username of the Ku user we're interested in. Required.
    -o --outputFolder <path>       The relative path to the folder in which the downloaded files should be written. Default: ./ku
```

