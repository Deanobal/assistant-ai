export async function submitLeadCapture(form, options = {}) {
  const response = await fetch('/api/lead-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form, options })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || 'Lead capture failed');
  }

  return data.lead;
}
