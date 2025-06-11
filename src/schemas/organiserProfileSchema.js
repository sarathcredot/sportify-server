
const {z}=require("zod")



const organiserProfileSchema=z.object({

      fullName:z.string().min(1, " FullName is required"),
      email:z.string().optional(),
      phoneNumber:z.string().min(1, "phoneNumber is required"),
      photoUrl:z.string().optional(),

        
})


module.exports={
 
  organiserProfileSchema
}