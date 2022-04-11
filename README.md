# master-printer
CLI for fixing b0rked NFTs 

(Prints them a metaplex master edition so they can be ingested into OpenSea)

Use:

Edit `hashlist.json` with all your broken nft mints.

```bash
yarn
ts-node master-printer.ts -k <Path To Authority Wallet For NFTs> -r <Custom RPC Url>
```
 
The script is setup to be ran over and over safely until all nfts have master edtions printed.
If you get any errors just rerun the script at the end until they are no more.

Community PR Requests:

*Batch requests into 3-5tx and wait for each

*Grab hashlist of borked NFTs automagically from update authorty
