# Product vision

Woodworks helps hobbyist woodworkers take their furniture projects to the next
level: design a piece, plan the build, run it in the shop and learn from it.

## Two surfaces

- **Web app (preparation):** designing, detailed project status, photos, extra
  info, logging problems and delays. It is also installable on a phone (PWA) so
  the basics work for people who don't install the native app.
- **Mobile app (execution, Expo):** in the shop. Quickly find measurements, see
  the todo list and what needs doing next, and what to buy.

## First focus

1. **Design:** a full 3D drawing tool. A drawing carries an ordered stack of
   transformation steps (move, rotate, scale, mirror around a point or plane)
   and can be mapped into a machine's coordinate frame, because CNC machines
   differ in where zero is and whether an axis counts positive or negative.
2. **Inventory:** materials, assets and machines.
3. **Lending and borrowing:** lend machines out or borrow them, both with
   people connected in the app and with people who don't use it (you type
   their name in yourself).
4. **Machine availability:** some machines can only be used on certain days,
   e.g. a big CNC at school on Tuesday evenings.

## Constraints

- Easy to deploy and as cheap as possible to host.
- Built as a multi-tenant SaaS.

Decisions confirmed by Mathieu on 2026-10-05.
