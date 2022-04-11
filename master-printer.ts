import {
  createCreateMasterEditionV3Instruction,
  CreateMasterEditionV3InstructionAccounts,
  CreateMasterEditionArgs,
  CreateMasterEditionInstructionArgs,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import hashList from "./hashlist.json";
import fs from "fs";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

async function main(args: any) {
  let successes = 0;
  let failures = 0;
  let keypair = process.env.HOME + "/.config/solana/id.json";
  let splitAuthority = false;
  let updateAuthority = "";
  let mintAuthority = "";
  let connection = new Connection("https://api.mainnet-beta.solana.com");

  for (let i = 0; i < args.length; i++)
    if (args[i] == "-r") connection = new Connection(args[++i]);
    else if (args[i] == "-k") keypair = args[++i];
    else if (args[i] == "-u") {
      updateAuthority = args[++i];
      splitAuthority = true;
    } else if (args[i] == "-m") {
      mintAuthority = args[++i];
      splitAuthority = true;
    }

  let updateKeypair: Keypair;
  let mintKeypair: Keypair;

  if (splitAuthority) {
    updateKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(updateAuthority).toString()))
    );
    mintKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(mintAuthority).toString()))
    );
  }

  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
  );
  console.log(wallet.publicKey.toString());

  let rawdata: any = {};
  try {
    rawdata = fs.readFileSync("./config.json");
  } catch (err) {
    for (let i = 0; i < hashList.length; i++) {
      const hash: string = hashList[i];

      rawdata[hash] = false;
    }
    fs.writeFileSync("./config.json", JSON.stringify(rawdata));
  }
  let config = JSON.parse(rawdata.toString());
  console.log("config", config);

  for (const hash in config) {
    const processed = config[hash];
    if (!processed) {
      try {
        let mint = new PublicKey(hash);
        const [masterKey, _masterBump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        );
        const [metadatakey, _metaBump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        );
        if (splitAuthority) {
          let masterEdition = {
            edition: masterKey,
            mint: mint,
            updateAuthority: updateKeypair!.publicKey,
            mintAuthority: mintKeypair!.publicKey,
            payer: wallet.publicKey,
            metadata: metadatakey,
          } as CreateMasterEditionV3InstructionAccounts;
          let masterArgs = {
            maxSupply: 1,
          } as CreateMasterEditionArgs;
          let masterEditionInstructionArgs = {
            createMasterEditionArgs: masterArgs,
          } as CreateMasterEditionInstructionArgs;
          let ix = createCreateMasterEditionV3Instruction(
            masterEdition,
            masterEditionInstructionArgs
          );
          const transaction = new Transaction().add(ix);
          await sendAndConfirmTransaction(connection, transaction, [
            wallet,
            updateKeypair!,
            mintKeypair!,
          ]);
        } else {
          let masterEdition = {
            edition: masterKey,
            mint: mint,
            updateAuthority: wallet.publicKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            metadata: metadatakey,
          } as CreateMasterEditionV3InstructionAccounts;
          let masterArgs = {
            maxSupply: 1,
          } as CreateMasterEditionArgs;
          let masterEditionInstructionArgs = {
            createMasterEditionArgs: masterArgs,
          } as CreateMasterEditionInstructionArgs;
          let ix = createCreateMasterEditionV3Instruction(
            masterEdition,
            masterEditionInstructionArgs
          );
          const transaction = new Transaction().add(ix);
          await sendAndConfirmTransaction(connection, transaction, [wallet]);
        }
        successes++;
      } catch (e) {
        console.log(e);
        console.log("failed to create master edition for:", hash);
        failures++;
      }
    }
  }
  failures == 0
    ? console.log("all master editions created")
    : console.log(
        `Only ${successes}/${
          successes + failures
        } master editions created... please rerun.`
      );
}

if (require.main) main(process.argv.slice(2)).catch(console.error);
