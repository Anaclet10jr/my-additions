'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const styleLabel = s => s?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

export default function InteriorProjectDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGallery, setActiveGallery] = useState('after');
  const [imgIdx, setImgIdx]               = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/interior/${id}`);
        setProject(data);
      } catch { router.push('/interior-design'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700" />
    </div>
  );
  if (!project) return null;

  const galleries = {
    after:     { label: 'After',      images: project.after     || [] },
    before:    { label: 'Before',     images: project.before    || [] },
    moodBoard: { label: 'Mood Board', images: project.moodBoard || [] },
  };
  const currentImages = galleries[activeGallery].images;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">← Back</button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden h-80 bg-gray-200 mb-3">
              {currentImages.length > 0 ? (
                <img src={currentImages[imgIdx]} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No photos in this gallery</div>
              )}
            </div>

            {/* Gallery tabs */}
            <div className="flex gap-2 mb-3">
              {Object.entries(galleries).map(([key, { label, images }]) => (
                images.length > 0 && (
                  <button key={key} onClick={() => { setActiveGallery(key); setImgIdx(0); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeGallery === key ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border hover:bg-stone-50'
                    }`}>
                    {label} ({images.length})
                  </button>
                )
              ))}
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {currentImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}>
                    <img src={img} className={`h-16 w-24 object-cover rounded-lg flex-shrink-0 border-2 transition ${
                      i === imgIdx ? 'border-stone-700' : 'border-transparent'
                    }`} />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.style && (
                <span className="bg-stone-100 text-stone-700 text-sm px-3 py-1 rounded-full">{styleLabel(project.style)}</span>
              )}
              {project.roomType?.map(r => (
                <span key={r} className="bg-amber-50 text-amber-700 text-sm px-3 py-1 rounded-full">{styleLabel(r)}</span>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>

            {project.budget?.min && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
                <p className="text-sm text-gray-500 mb-1">Project Budget Range</p>
                <p className="text-xl font-bold text-stone-800">
                  {project.budget.min.toLocaleString()} – {project.budget.max?.toLocaleString()} RWF
                </p>
              </div>
            )}

            {project.duration && (
              <div className="mt-3 bg-white rounded-xl p-5 shadow-sm border border-stone-100">
                <p className="text-sm text-gray-500 mb-1">Typical Duration</p>
                <p className="font-semibold text-stone-800">{project.duration}</p>
              </div>
            )}
          </div>

          {/* Designer sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Designer</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center text-xl font-bold text-stone-600">
                  {project.designer?.avatar
                    ? <img src={project.designer.avatar} className="w-full h-full object-cover" />
                    : project.designer?.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{project.designer?.name}</p>
                  <p className="text-gray-400 text-xs">Interior Designer</p>
                </div>
              </div>

              <Link href={`/interior-design/request?designer=${project.designer?._id}`}
                className="block w-full text-center bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl font-semibold transition mb-3">
                Request This Designer
              </Link>

              <a href={`https://wa.me/250${project.designer?.phone?.replace(/^0/,'')}?text=Hi, I saw your project "${project.title}" on Inzu and I'm interested`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 py-3 rounded-xl font-medium transition w-full text-sm">
                💬 WhatsApp Designer
              </a>
            </div>

            {project.isFeatured && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <span className="text-amber-600 font-semibold">⭐ Featured Project</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
