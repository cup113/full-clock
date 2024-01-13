call pnpm run build
git tag %1
call netlify deploy --prod -d dist --message %1
git push origin main
gh release create %1
