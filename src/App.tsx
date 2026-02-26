import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Target, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Clock, 
  DollarSign,
  Settings as SettingsIcon,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Material, PointType, Recipe, Settings, RecipeMaterial, RecipePoint } from './types';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'materials', icon: Package, label: 'Linhas & Fios' },
    { id: 'points', icon: Target, label: 'Tipos de Pontos' },
    { id: 'recipes', icon: FileText, label: 'Receitas' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfólio' },
    { id: 'settings', icon: SettingsIcon, label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-white border-r border-black/5 h-screen sticky top-0 flex flex-col p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-brand-olive italic">Pontual</h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Precificação Inteligente</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-brand-olive text-white shadow-md' 
                : 'text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- Pages ---

const Dashboard = ({ recipes, setActiveTab }: { recipes: Recipe[], setActiveTab: (t: string) => void }) => {
  const totalProfit = recipes.reduce((acc, r) => {
    const materialCost = r.materials.reduce((sum, m) => sum + (m.length_used * (m.cost_per_meter || 0)), 0);
    const laborCost = r.points.reduce((sum, p) => sum + (p.quantity * (p.unit_time || 0)), 0) / 3600 * 20; // Mock hourly rate for dashboard preview
    const totalCost = materialCost + laborCost;
    return acc + (r.suggested_price - totalCost);
  }, 0);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif">Bem-vinda de volta!</h2>
        <p className="text-zinc-500">Aqui está o resumo do seu ateliê hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-brand-olive text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-sm uppercase tracking-wider">Lucro Estimado Total</p>
              <h3 className="text-3xl font-bold mt-1">R$ {totalProfit.toFixed(2)}</h3>
            </div>
            <TrendingUp className="text-white/40" />
          </div>
        </div>
        
        <div className="card">
          <p className="text-zinc-400 text-sm uppercase tracking-wider">Receitas Cadastradas</p>
          <h3 className="text-3xl font-bold mt-1">{recipes.length}</h3>
        </div>

        <div className="card">
          <p className="text-zinc-400 text-sm uppercase tracking-wider">Valor Médio Peça</p>
          <h3 className="text-3xl font-bold mt-1">
            R$ {(recipes.reduce((acc, r) => acc + r.suggested_price, 0) / (recipes.length || 1)).toFixed(2)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-xl mb-4">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('recipes')}
              className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-200 rounded-2xl hover:border-brand-olive hover:bg-brand-olive/5 transition-all group"
            >
              <Plus className="text-zinc-400 group-hover:text-brand-olive mb-2" />
              <span className="text-sm font-medium text-zinc-600">Novo Orçamento</span>
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-200 rounded-2xl hover:border-brand-olive hover:bg-brand-olive/5 transition-all group"
            >
              <Package className="text-zinc-400 group-hover:text-brand-olive mb-2" />
              <span className="text-sm font-medium text-zinc-600">Adicionar Linha</span>
            </button>
          </div>
        </div>

        <div className="card">
          <h4 className="text-xl mb-4">Últimas Receitas</h4>
          <div className="space-y-3">
            {recipes.slice(0, 3).map(r => (
              <div key={r.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-zinc-400">{r.category}</p>
                </div>
                <p className="font-bold text-brand-olive">R$ {r.suggested_price.toFixed(2)}</p>
              </div>
            ))}
            {recipes.length === 0 && <p className="text-zinc-400 text-center py-4 italic">Nenhuma receita ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialsPage = ({ materials, onAdd, onDelete }: { materials: Material[], onAdd: (m: any) => void, onDelete: (id: number) => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price_paid: '', total_length: '', total_weight: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price_paid: parseFloat(formData.price_paid),
      total_length: parseFloat(formData.total_length),
      total_weight: parseFloat(formData.total_weight)
    });
    setFormData({ name: '', price_paid: '', total_length: '', total_weight: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Gestão de Linhas & Fios</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Material
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-zinc-50"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Nome do Fio</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Barroco 6" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Preço Pago (R$)</label>
                <input required type="number" step="0.01" className="input-field" value={formData.price_paid} onChange={e => setFormData({...formData, price_paid: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Metragem (m)</label>
                <input required type="number" className="input-field" value={formData.total_length} onChange={e => setFormData({...formData, total_length: e.target.value})} placeholder="Ex: 400" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Peso (g)</label>
                <input required type="number" className="input-field" value={formData.total_weight} onChange={e => setFormData({...formData, total_weight: e.target.value})} placeholder="Ex: 200" />
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-zinc-500">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Material</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m => (
          <div key={m.id} className="card group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-medium">{m.name}</h3>
              <button onClick={() => onDelete(m.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Preço Pago</span>
                <span className="font-medium">R$ {m.price_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Metragem</span>
                <span className="font-medium">{m.total_length}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Custo por Metro</span>
                <span className="font-bold text-brand-olive">R$ {m.cost_per_meter.toFixed(4)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PointsPage = ({ points, onAdd, onDelete }: { points: PointType[], onAdd: (p: any) => void, onDelete: (id: number) => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', abbreviation: '', sample_time_10: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      sample_time_10: parseFloat(formData.sample_time_10)
    });
    setFormData({ name: '', abbreviation: '', sample_time_10: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Configuração de Pontos</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Ponto
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-zinc-50"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Nome do Ponto</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Ponto Alto" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Abreviação</label>
                <input type="text" className="input-field" value={formData.abbreviation} onChange={e => setFormData({...formData, abbreviation: e.target.value})} placeholder="Ex: pa" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Tempo Amostra (10 pts em seg)</label>
                <input required type="number" className="input-field" value={formData.sample_time_10} onChange={e => setFormData({...formData, sample_time_10: e.target.value})} placeholder="Ex: 60" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-zinc-500">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Ponto</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {points.map(p => (
          <div key={p.id} className="card group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-medium">{p.name}</h3>
                <span className="text-xs font-bold uppercase text-zinc-400">{p.abbreviation}</span>
              </div>
              <button onClick={() => onDelete(p.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Tempo (10 pts)</span>
                <span className="font-medium">{p.sample_time_10}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tempo Unitário</span>
                <span className="font-bold text-brand-olive">{p.unit_time.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecipesPage = ({ recipes, materials, points, settings, onAdd, onDelete }: { 
  recipes: Recipe[], 
  materials: Material[], 
  points: PointType[], 
  settings: Settings,
  onAdd: (r: any) => void,
  onDelete: (id: number) => void
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    profit_margin: 30,
    materials: [] as RecipeMaterial[],
    points: [] as RecipePoint[]
  });

  const calculateSuggestedPrice = () => {
    const materialCost = formData.materials.reduce((acc, rm) => {
      const m = materials.find(mat => mat.id === rm.material_id);
      return acc + (rm.length_used * (m?.cost_per_meter || 0));
    }, 0);

    const laborTimeSeconds = formData.points.reduce((acc, rp) => {
      const p = points.find(pt => pt.id === rp.point_type_id);
      return acc + (rp.quantity * (p?.unit_time || 0));
    }, 0);

    const laborCost = (laborTimeSeconds / 3600) * settings.hourly_rate;
    const totalCost = materialCost + laborCost;
    return totalCost * (1 + formData.profit_margin / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      suggested_price: calculateSuggestedPrice()
    });
    setFormData({ name: '', category: '', profit_margin: 30, materials: [], points: [] });
    setShowForm(false);
  };

  const addMaterialRow = () => {
    if (materials.length > 0) {
      setFormData({ ...formData, materials: [...formData.materials, { material_id: materials[0].id, length_used: 0 }] });
    }
  };

  const addPointRow = () => {
    if (points.length > 0) {
      setFormData({ ...formData, points: [...formData.points, { point_type_id: points[0].id, quantity: 0 }] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Cadastro de Receitas & Orçamentos</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Receita
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card bg-zinc-50 max-w-4xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Nome da Peça</label>
                  <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Amigurumi Urso" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Categoria</label>
                  <input type="text" className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Decoração" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Materials Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium flex items-center gap-2"><Package size={16} /> Materiais</h4>
                    <button type="button" onClick={addMaterialRow} className="text-xs text-brand-olive font-bold uppercase">+ Adicionar</button>
                  </div>
                  {formData.materials.map((rm, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select 
                        className="input-field flex-1"
                        value={rm.material_id}
                        onChange={e => {
                          const newMats = [...formData.materials];
                          newMats[idx].material_id = parseInt(e.target.value);
                          setFormData({...formData, materials: newMats});
                        }}
                      >
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <input 
                        type="number" 
                        className="input-field w-24" 
                        placeholder="m"
                        value={rm.length_used || ''}
                        onChange={e => {
                          const newMats = [...formData.materials];
                          newMats[idx].length_used = parseFloat(e.target.value);
                          setFormData({...formData, materials: newMats});
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Points Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium flex items-center gap-2"><Target size={16} /> Contagem de Pontos</h4>
                    <button type="button" onClick={addPointRow} className="text-xs text-brand-olive font-bold uppercase">+ Adicionar</button>
                  </div>
                  {formData.points.map((rp, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select 
                        className="input-field flex-1"
                        value={rp.point_type_id}
                        onChange={e => {
                          const newPts = [...formData.points];
                          newPts[idx].point_type_id = parseInt(e.target.value);
                          setFormData({...formData, points: newPts});
                        }}
                      >
                        {points.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input 
                        type="number" 
                        className="input-field w-24" 
                        placeholder="qtd"
                        value={rp.quantity || ''}
                        onChange={e => {
                          const newPts = [...formData.points];
                          newPts[idx].quantity = parseInt(e.target.value);
                          setFormData({...formData, points: newPts});
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">Margem de Lucro (%)</label>
                    <input type="number" className="input-field w-24" value={formData.profit_margin} onChange={e => setFormData({...formData, profit_margin: parseFloat(e.target.value)})} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-zinc-400">Preço Sugerido</p>
                    <p className="text-2xl font-bold text-brand-olive">R$ {calculateSuggestedPrice().toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-zinc-500">Cancelar</button>
                  <button type="submit" className="btn-primary">Salvar Receita</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {recipes.map(r => (
          <div key={r.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-xl font-medium">{r.name}</h3>
              <p className="text-sm text-zinc-400">{r.category} • {r.materials.length} materiais • {r.points.reduce((acc, p) => acc + p.quantity, 0)} pontos</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-zinc-400">Preço de Venda</p>
                <p className="text-xl font-bold text-brand-olive">R$ {r.suggested_price.toFixed(2)}</p>
              </div>
              <button onClick={() => onDelete(r.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = ({ settings, onUpdate }: { settings: Settings, onUpdate: (s: Settings) => void }) => {
  const [rate, setRate] = useState(settings.hourly_rate);

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-3xl font-serif">Configurações</h2>
      <div className="card">
        <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Valor da Hora da Artesã (R$)</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            className="input-field" 
            value={rate} 
            onChange={e => setRate(parseFloat(e.target.value))} 
          />
          <button onClick={() => onUpdate({ hourly_rate: rate })} className="btn-primary">Salvar</button>
        </div>
        <p className="text-xs text-zinc-400 mt-4">
          Este valor é utilizado para calcular o custo de mão de obra baseado no tempo unitário de cada ponto.
        </p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [points, setPoints] = useState<PointType[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<Settings>({ hourly_rate: 20 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [mRes, pRes, rRes, sRes] = await Promise.all([
      fetch('/api/materials'),
      fetch('/api/points'),
      fetch('/api/recipes'),
      fetch('/api/settings')
    ]);
    setMaterials(await mRes.json());
    setPoints(await pRes.json());
    setRecipes(await rRes.json());
    setSettings(await sRes.json());
  };

  const handleAddMaterial = async (m: any) => {
    await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m)
    });
    fetchData();
  };

  const handleDeleteMaterial = async (id: number) => {
    await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddPoint = async (p: any) => {
    await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    fetchData();
  };

  const handleDeletePoint = async (id: number) => {
    await fetch(`/api/points/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddRecipe = async (r: any) => {
    await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    fetchData();
  };

  const handleDeleteRecipe = async (id: number) => {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpdateSettings = async (s: Settings) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    fetchData();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard recipes={recipes} setActiveTab={setActiveTab} />}
            {activeTab === 'materials' && <MaterialsPage materials={materials} onAdd={handleAddMaterial} onDelete={handleDeleteMaterial} />}
            {activeTab === 'points' && <PointsPage points={points} onAdd={handleAddPoint} onDelete={handleDeletePoint} />}
            {activeTab === 'recipes' && (
              <RecipesPage 
                recipes={recipes} 
                materials={materials} 
                points={points} 
                settings={settings}
                onAdd={handleAddRecipe}
                onDelete={handleDeleteRecipe}
              />
            )}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-serif">Portfólio de Orçamentos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(r => (
                    <div key={r.id} className="card group overflow-hidden p-0">
                      <div className="h-40 bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <FileText size={48} />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-medium mb-1">{r.name}</h3>
                        <p className="text-sm text-zinc-400 mb-4">{r.category}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-brand-olive">R$ {r.suggested_price.toFixed(2)}</span>
                          <button className="text-brand-olive hover:underline text-sm font-medium">Ver Detalhes</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'settings' && <SettingsPage settings={settings} onUpdate={handleUpdateSettings} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
