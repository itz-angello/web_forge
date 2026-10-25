import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../js/config.js';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const labels = { nuevo: 'Nuevo', contactado: 'Contactado', cotizado: 'Cotizado', ganado: 'Ganado', perdido: 'Perdido' };
const projectLabels = { en_diseno: 'En diseño', en_revision: 'En revisión', entregado: 'Entregado', mantenimiento: 'Mantenimiento' };
let leads = [];

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function showApp(visible) {
  $('login-view').hidden = visible;
  $('app-view').hidden = !visible;
}

async function refreshSession() {
  const { data: { session } } = await client.auth.getSession();
  showApp(Boolean(session));
  if (session) { await loadLeads(); await loadProjects(); }
}

async function loadLeads() {
  $('leads-message').textContent = 'Cargando leads…';
  const { data, error } = await client.from('leads').select('*').order('created_at', { ascending: false });
  if (error) { $('leads-message').textContent = 'No se pudieron cargar los leads: ' + error.message; return; }
  leads = data || [];
  renderLeads();
}

function renderLeads() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const status = $('status-filter').value;
  const filtered = leads.filter((lead) => (!status || lead.status === status) &&
    `${lead.name} ${lead.business} ${lead.whatsapp} ${lead.email || ''}`.toLocaleLowerCase().includes(query));
  $('leads-body').innerHTML = filtered.map((lead) => `
    <tr data-id="${safe(lead.id)}"><td>${new Date(lead.created_at).toLocaleDateString('es-GT')}</td>
      <td><span class="person">${safe(lead.name)}</span><span class="sub">${safe(lead.business)}</span><span class="sub">${safe(lead.email || 'Sin correo')}</span><a class="wa" target="_blank" rel="noopener" href="https://wa.me/${safe(whatsappNumber(lead.whatsapp))}">Abrir WhatsApp ↗</a></td>
      <td>${safe(lead.project_type)}<span class="sub">${safe(lead.message)}</span></td>
      <td><select class="lead-status" aria-label="Estado del lead">${Object.entries(labels).map(([key, label]) => `<option value="${key}" ${lead.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select></td>
      <td><textarea class="lead-notes" rows="2" maxlength="3000" placeholder="Notas…">${safe(lead.notes || '')}</textarea></td>
      <td><div class="row-actions"><button class="small save-lead">Guardar</button>${lead.status !== 'ganado' ? '<button class="small convert">Convertir en cliente</button>' : ''}</div></td>
    </tr>`).join('');
  $('leads-message').textContent = filtered.length ? `${filtered.length} lead(s)` : 'No hay leads que coincidan.';
}

async function loadProjects() {
  const { data, error } = await client.from('projects').select('*, clients(name,business)').order('created_at', { ascending: false });
  if (error) { $('projects-message').textContent = 'No se pudieron cargar proyectos: ' + error.message; return; }
  $('projects-body').innerHTML = (data || []).map((project) => `<tr>
    <td><strong>${safe(project.title)}</strong></td><td>${safe(project.clients?.name)}<span class="sub">${safe(project.clients?.business)}</span></td>
    <td>${safe(projectLabels[project.status] || project.status)}</td><td>${money(project.price)}</td><td>${money(project.deposit_paid)}</td>
    <td>${project.due_date ? new Date(`${project.due_date}T12:00:00`).toLocaleDateString('es-GT') : '—'}</td>
    <td>${project.live_url ? `<a href="${safe(project.live_url)}" target="_blank" rel="noopener">Abrir ↗</a>` : '—'}</td></tr>`).join('');
  $('projects-message').textContent = data?.length ? `${data.length} proyecto(s)` : 'Todavía no hay proyectos.';
}

function money(value) { return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(Number(value || 0)); }
function whatsappNumber(value) { const digits = String(value || '').replace(/\D/g, ''); return digits.length === 8 ? `502${digits}` : digits; }

$('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  $('login-error').textContent = '';
  const { error } = await client.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-password').value });
  button.disabled = false;
  if (error) { $('login-error').textContent = 'No se pudo iniciar sesión. Revisa el correo y la contraseña.'; return; }
  await refreshSession();
});

$('logout').addEventListener('click', async () => { await client.auth.signOut(); showApp(false); });
$('search').addEventListener('input', renderLeads);
$('status-filter').addEventListener('change', renderLeads);
$('leads-body').addEventListener('click', async (event) => {
  const row = event.target.closest('tr');
  if (!row) return;
  const lead = leads.find((item) => item.id === row.dataset.id);
  if (event.target.closest('.save-lead')) {
    const { error } = await client.from('leads').update({ status: row.querySelector('.lead-status').value, notes: row.querySelector('.lead-notes').value.trim() || null }).eq('id', lead.id);
    if (error) alert('No se pudo guardar: ' + error.message); else await loadLeads();
  }
  if (event.target.closest('.convert')) await convertLead(lead);
});

async function convertLead(lead) {
  const title = prompt('Nombre del proyecto:', lead.project_type);
  if (!title) return;
  const priceText = prompt('Precio total (GTQ):', '0');
  if (priceText === null || !Number.isFinite(Number(priceText)) || Number(priceText) < 0) { alert('Ingresa un precio válido.'); return; }
  const depositText = prompt('Anticipo pagado (GTQ):', '0');
  if (depositText === null || !Number.isFinite(Number(depositText)) || Number(depositText) < 0) { alert('Ingresa un anticipo válido.'); return; }
  const dueDate = prompt('Fecha de entrega (AAAA-MM-DD, opcional):', '');
  const { data: clientRow, error: clientError } = await client.from('clients').insert({ lead_id: lead.id, name: lead.name, business: lead.business, whatsapp: lead.whatsapp, email: lead.email }).select('id').single();
  if (clientError) { alert('No se pudo crear el cliente: ' + clientError.message); return; }
  const { error: projectError } = await client.from('projects').insert({ client_id: clientRow.id, title: title.trim(), price: Number(priceText), deposit_paid: Number(depositText), due_date: dueDate || null });
  if (projectError) {
    await client.from('clients').delete().eq('id', clientRow.id);
    alert('No se pudo crear el proyecto: ' + projectError.message);
    return;
  }
  const { error: leadError } = await client.from('leads').update({ status: 'ganado' }).eq('id', lead.id);
  if (leadError) alert('Cliente y proyecto creados, pero no se pudo actualizar el lead.');
  await loadLeads(); await loadProjects();
}

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((button) => button.classList.toggle('active', button === tab));
  $('leads-view').hidden = tab.dataset.view !== 'leads';
  $('projects-view').hidden = tab.dataset.view !== 'projects';
}));

client.auth.onAuthStateChange((_event, session) => { showApp(Boolean(session)); });
refreshSession();
