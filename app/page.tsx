import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * sebagai pengunjunga atau masyarakat raja amapat kira perlu sadari bahawa 
 * keindahan alam bukan utnuk diexplotiasi tai untuk dijaga 
 * 
 * tambang nilke mungkng menguntungkan untuk seata tapi kerusakanya belangusng sealmanya 
 * 
 * mari kita pilih keindahaan alam yang lestari atau penyesalahan yang abana
 */



export default async function Home() {

  const session = await getServerSession(authOptions);
  console.log(session)
  if (!session) {
    redirect("/login");
  }

  redirect("/main");

  
}
1