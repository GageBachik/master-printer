import { Connection } from "@metaplex/js";
import {
  createCreateMasterEditionV3Instruction,
  CreateMasterEditionV3InstructionAccounts,
  CreateMasterEditionArgs,
  CreateMasterEditionInstructionArgs,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";

import id from "./wallet/OSTest.json";

(async () => {
  const connection = new Connection("mainnet-beta");
  const secretKey = new Uint8Array(id);
  const wallet = Keypair.fromSecretKey(secretKey);
  console.log(wallet.publicKey.toString());

  let edition = new PublicKey("9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK");
  let mint = new PublicKey("9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK");
  let updateAuthority = new PublicKey(
    "9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK"
  );
  let mintAuthority = new PublicKey(
    "9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK"
  );
  let payer = new PublicKey("9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK");
  let metadata = new PublicKey("9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK");
  let masterEdition = {
    edition: edition,
    mint: mint,
    updateAuthority: updateAuthority,
    mintAuthority: mintAuthority,
    payer: payer,
    metadata: metadata,
  } as CreateMasterEditionV3InstructionAccounts;
  let masterArgs = {
    maxSupply: 1,
  } as CreateMasterEditionArgs;
  let masterEditionInstructionArgs = {
    createMasterEditionArgs: masterArgs,
  } as CreateMasterEditionInstructionArgs;
  let ix = await createCreateMasterEditionV3Instruction(
    masterEdition,
    masterEditionInstructionArgs
  );

  const transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [wallet]);
})();
