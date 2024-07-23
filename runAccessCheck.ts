import checkAndUpdateAccess from "@/lib/checkAndUpdateAccess";

const runAccessCheck = async () => {
  await checkAndUpdateAccess();
  process.exit(0);
};

runAccessCheck();