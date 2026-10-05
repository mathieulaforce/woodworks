import { formatLength } from '@woodworks/core'
import { apply, compose, type TransformStep } from '@woodworks/geometry'

// Placeholder screen proving the shared packages are wired up. Replace with
// the real router and screens as features land.
const demoSteps: TransformStep[] = [
  { kind: 'mirror', plane: 'yz', through: [300, 0, 0] },
  { kind: 'machineFrame', origin: [0, 0, 18], direction: { x: 1, y: 1, z: 1 } },
]

function App() {
  const [x, y, z] = apply(compose(demoSteps), [250, 40, 12])

  return (
    <main>
      <h1>Woodworks</h1>
      <p>Design, plan and build your woodworking projects.</p>
      <p>
        Demo: a point at 250, 40, 12 mm, mirrored around x = 300 mm and moved into a CNC
        frame with Z zero on top of an 18 mm board, lands at {formatLength(x, 'mm')},{' '}
        {formatLength(y, 'mm')}, {formatLength(z, 'mm')}.
      </p>
    </main>
  )
}

export default App
