export interface Product {
  name: string;
  price: number;
  brand: { name: string }[] | null;
}

export async function askProductBot(userMessage: string, productList: Product[] = []) {
  const productInfo = productList.map(p =>
    `• ${p.name} (${Array.isArray(p.brand) && p.brand.length > 0 ? p.brand[0].name : "ไม่ทราบแบรนด์"}) - ฿${p.price}`
  ).join("\n");

  const systemPrompt = `
คุณคือตัวช่วยขายของออนไลน์ที่ตอบคำถามลูกค้าโดยอ้างอิงจากรายการสินค้าในสต็อกเท่านั้น
ถ้าหาไม่เจอ ให้บอกว่า "ขออภัย สินค้าที่คุณถามไม่มีในระบบตอนนี้"

นี่คือรายการสินค้า:
${productInfo}
`;

  const response = await fetch("https://dd78026b8c48.ngrok-free.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemma3:4b", // หรือ "mistral", "gemma", "phi3"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      stream: false
    }),
  });

  const result = await response.json();

  return result.message?.content || "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบ";
}
