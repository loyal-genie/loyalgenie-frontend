import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, RoundedBox, MeshDistortMaterial, Torus, Html } from '@react-three/drei'
import * as THREE from 'three'

type Phase = 'app' | 'shake' | 'reveal'

const CYCLE       = 14   // seconds per full loop
const SHAKE_START = 2.5
const SHAKE_END   = 5.2  // 2.7s shake — long enough to feel satisfying
const REVEAL_END  = 11.5 // plenty of time to read the reward

// ─── Normal app screen ────────────────────────────────────────────────────────

function AppNormalScreen() {
  return (
    <div style={{ padding: '8px', height: '100%', boxSizing: 'border-box' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#8b7db5', padding: '2px 4px 6px' }}>
        <span>9:41</span><span>🔋</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 2px' }}>
        <div>
          <div style={{ color: '#8b7db5', fontSize: '7px' }}>Good Morning 👋</div>
          <div style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>Priya</div>
        </div>
        <span style={{ fontSize: '14px' }}>🧞</span>
      </div>

      {/* Active reward card */}
      <div style={{ background: 'linear-gradient(135deg, #3d1f8a, #6b3fd4)', borderRadius: '8px', padding: '8px', marginBottom: '8px' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '6px', marginBottom: '2px' }}>ACTIVE REWARD</div>
        <div style={{ color: '#f0c040', fontSize: '10px', fontWeight: 900 }}>Free Blow-dry</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '6px' }}>Glow Salon · 3 days left</div>
        <div style={{ marginTop: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px 8px', display: 'inline-block', color: '#fff', fontSize: '6px', fontWeight: 600 }}>Tap to Redeem</div>
      </div>

      {/* My places */}
      <div style={{ color: '#8b7db5', fontSize: '6px', marginBottom: '5px', padding: '0 2px' }}>MY PLACES</div>
      {[
        { name: 'Brew & Co.', emoji: '☕', pts: '240 pts' },
        { name: 'PawCare', emoji: '🐾', pts: '80 pts' },
      ].map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(26,11,75,0.6)', borderRadius: '6px', padding: '5px 7px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px' }}>{p.emoji}</span>
            <span style={{ color: '#fff', fontSize: '7px', fontWeight: 600 }}>{p.name}</span>
          </div>
          <span style={{ color: '#f0c040', fontSize: '6px', fontWeight: 600 }}>{p.pts}</span>
        </div>
      ))}

      {/* Bottom nav */}
      <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
        {[['🏠', 'Home'], ['🔍', 'Discover'], ['👛', 'Wallet'], ['👤', 'Profile']].map(([icon, label], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px' }}>{icon}</div>
            <div style={{ fontSize: '5px', color: i === 0 ? '#f0c040' : '#8b7db5', marginTop: '1px' }}>{label as string}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reward reveal screen ─────────────────────────────────────────────────────

const CONFETTI = [
  { left: '12%', top: '20%', color: '#f0c040', delay: '0s',    size: 5, round: true  },
  { left: '78%', top: '16%', color: '#6b3fd4', delay: '0.08s', size: 4, round: false },
  { left: '42%', top: '10%', color: '#e9a820', delay: '0.04s', size: 3, round: true  },
  { left: '88%', top: '33%', color: '#ffffff', delay: '0.12s', size: 4, round: false },
  { left: '8%',  top: '45%', color: '#f0c040', delay: '0.16s', size: 3, round: true  },
  { left: '62%', top: '26%', color: '#ff6b8a', delay: '0.06s', size: 5, round: false },
  { left: '22%', top: '30%', color: '#6b3fd4', delay: '0.10s', size: 3, round: true  },
  { left: '92%', top: '14%', color: '#f0c040', delay: '0.14s', size: 4, round: true  },
  { left: '52%', top: '7%',  color: '#ffffff', delay: '0.02s', size: 3, round: false },
  { left: '72%', top: '50%', color: '#e9a820', delay: '0.18s', size: 4, round: true  },
]

function RewardScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 50% 35%, rgba(61,31,138,0.75) 0%, #0f0628 68%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '5px', padding: '12px', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti */}
      {CONFETTI.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, top: d.top,
          width: `${d.size}px`, height: `${d.size}px`,
          borderRadius: d.round ? '50%' : '2px',
          background: d.color,
          animation: `confetti-rise 1.4s ease-out ${d.delay} both`,
        }} />
      ))}

      {/* Genie */}
      <div style={{ fontSize: '30px', lineHeight: 1, animation: 'reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0s both' }}>
        🧞
      </div>

      {/* You Won */}
      <div style={{ color: '#ffffff', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', animation: 'reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.10s both' }}>
        YOU WON!
      </div>

      {/* Reward */}
      <div style={{ color: '#f0c040', fontSize: '14px', fontWeight: 900, lineHeight: 1.2, textAlign: 'center', animation: 'reward-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.18s both' }}>
        Complimentary<br />Service
      </div>

      {/* Subtitle */}
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '7px', textAlign: 'center', lineHeight: 1.5, animation: 'reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.28s both' }}>
        Glow Salon · Claim on<br />your next visit
      </div>

      {/* Button */}
      <div style={{
        background: 'linear-gradient(135deg, #f0c040, #e9a820)',
        borderRadius: '20px', padding: '5px 14px', marginTop: '3px',
        color: '#0a0520', fontSize: '7px', fontWeight: 800,
        animation: 'reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.38s both',
      }}>
        Tap to Redeem →
      </div>
    </div>
  )
}

// ─── Screen switcher ──────────────────────────────────────────────────────────

function AppScreen({ phase }: { phase: Phase }) {
  return (
    <div style={{
      width: '143px', height: '285px',
      background: '#0f0628', borderRadius: '14px',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box', userSelect: 'none',
    }}>
      {phase === 'reveal' ? <RewardScreen /> : <AppNormalScreen />}
    </div>
  )
}

// ─── Phone (shake + phase logic) ──────────────────────────────────────────────

function Phone() {
  const groupRef = useRef<THREE.Group>(null)
  const [screenPhase, setScreenPhase] = useState<Phase>('app')
  const phaseRef = useRef<Phase>('app')

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const ct = t % CYCLE

    // Resolve current phase
    const newPhase: Phase =
      ct >= SHAKE_START && ct < SHAKE_END ? 'shake' :
      ct >= SHAKE_END   && ct < REVEAL_END ? 'reveal' : 'app'

    if (newPhase !== phaseRef.current) {
      phaseRef.current = newPhase
      setScreenPhase(newPhase)
    }

    if (newPhase === 'shake') {
      const progress = (ct - SHAKE_START) / (SHAKE_END - SHAKE_START) // 0→1

      // Smooth plateau envelope: ramp up → full intensity → ramp down
      const raw = progress < 0.18 ? progress / 0.18
                : progress > 0.82 ? (1 - progress) / 0.18
                : 1
      const envelope = raw * raw * (3 - 2 * raw) // smoothstep — no sharp edges

      // Natural hand-shake frequency ~3.5 Hz with a harmonic for texture
      const f = 22
      groupRef.current.rotation.z =
        (Math.sin(t * f) * 0.22 + Math.sin(t * f * 1.65 + 0.6) * 0.05) * envelope
      groupRef.current.rotation.x =
        Math.sin(t * (f * 0.82) + 1.1) * 0.09 * envelope
      groupRef.current.position.x =
        (Math.sin(t * f + 0.4) * 0.16 + Math.sin(t * f * 2.2) * 0.03) * envelope
      groupRef.current.position.y =
        Math.abs(Math.sin(t * f * 1.4)) * 0.045 * envelope
    } else {
      // Springy return — low lerp factor gives a satisfying settle
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.07)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05)
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.07)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.07)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Phone body */}
        <RoundedBox args={[1.8, 3.6, 0.15]} radius={0.15} smoothness={6}>
          <meshStandardMaterial color="#1a0b4b" metalness={0.5} roughness={0.3} />
        </RoundedBox>
        {/* Screen background */}
        <RoundedBox args={[1.55, 3.1, 0.01]} radius={0.1} smoothness={6} position={[0, 0.05, 0.09]}>
          <meshStandardMaterial color="#0a0520" emissive="#3d1f8a" emissiveIntensity={0.2} />
        </RoundedBox>
        {/* Gold ring accent */}
        <Torus args={[0.18, 0.025, 16, 50]} position={[0, 1.7, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#f0c040" metalness={0.9} roughness={0.1} emissive="#f0c040" emissiveIntensity={0.3} />
        </Torus>
        {/* Home indicator */}
        <RoundedBox args={[0.4, 0.04, 0.01]} radius={0.02} position={[0, -1.6, 0.1]}>
          <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={0.5} />
        </RoundedBox>
        {/* App UI on screen */}
        <Html transform position={[0, 0.05, 0.105]} style={{ pointerEvents: 'none' }}>
          <AppScreen phase={screenPhase} />
        </Html>
      </group>
    </Float>
  )
}

// ─── Supporting scene objects ─────────────────────────────────────────────────

function FloatingCard({ position, color, delay }: { position: [number, number, number]; color: string; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.3
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.15
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
  })
  return (
    <mesh ref={meshRef} position={position}>
      <RoundedBox args={[0.7, 0.45, 0.05]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
      </RoundedBox>
    </mesh>
  )
}

function GoldOrb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.4
    meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.6 + position[2]) * 0.2
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={0.8} metalness={1} roughness={0} />
    </mesh>
  )
}

function GenieLamp() {
  const meshRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4
    meshRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
  })
  return (
    <group ref={meshRef} position={[2.8, -1.5, -1]}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <MeshDistortMaterial color="#f0c040" metalness={0.9} roughness={0.1} distort={0.2} speed={2} emissive="#f0c040" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.5, 0.1, 0]}>
        <torusGeometry args={[0.2, 0.05, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#f0c040" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Particles() {
  const count = 60
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return arr
  }, [])
  const geo = useRef<THREE.BufferGeometry>(null)
  useFrame(() => {
    if (!geo.current) return
    const pos = geo.current.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.005
      if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5
    }
    geo.current.attributes.position.needsUpdate = true
  })
  return (
    <points>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f0c040" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────

export default function FloatingScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#f0c040" />
      <pointLight position={[-5, 3, 3]} intensity={1} color="#6b3fd4" />
      <pointLight position={[0, -3, 4]} intensity={0.5} color="#3d1f8a" />
      <spotLight position={[0, 8, 4]} intensity={2} color="#ffffff" angle={0.3} penumbra={0.8} />

      <Stars radius={80} depth={40} count={800} factor={3} saturation={0.3} fade speed={0.5} />
      <Particles />

      <Phone />

      <FloatingCard position={[-3.2,  1.2, -0.5]} color="#3d1f8a" delay={0}   />
      <FloatingCard position={[ 3.0,  0.8, -1.0]} color="#1a0b4b" delay={1.5} />
      <FloatingCard position={[-2.8, -1.4, -0.8]} color="#221460" delay={3}   />
      <FloatingCard position={[ 3.2, -1.6, -0.5]} color="#3d1f8a" delay={2}   />

      <GoldOrb position={[-2.0,  2.0,  0.0]} />
      <GoldOrb position={[ 2.5,  1.5,  0.5]} />
      <GoldOrb position={[-1.5, -2.0,  0.5]} />
      <GoldOrb position={[ 1.8, -2.2,  0.0]} />
      <GoldOrb position={[ 0.5,  2.8, -0.5]} />
      <GoldOrb position={[-3.0,  0.0,  0.0]} />

      <GenieLamp />
    </Canvas>
  )
}
