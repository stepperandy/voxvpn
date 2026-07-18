Deno.serve(async (req) => {
  return new Response(JSON.stringify({
    action: "connect",
    destination: {
      type: "phone",
      number: "+233551442248"
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
});