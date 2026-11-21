(() => {
  const projectUrl = 'https://jeabmxjrjqxoewmcxcgl.supabase.co';
  const publishableKey = 'sb_publishable_zO0VFr51GRuYq_ytBuHM4Q_zuWk5_qL';

  window.catolicWebSupabase = window.supabase?.createClient
    ? window.supabase.createClient(projectUrl, publishableKey)
    : null;
})();
