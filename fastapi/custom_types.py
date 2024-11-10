from pydantic import BaseModel, Field
from typing import Optional


class ChatQnA(BaseModel):
  question: str
  answer: str

class BusinessDetails(BaseModel):
    business_name_dba: Optional[str] = Field(
        None, 
        description="Name of Business DBA",
        alias="(Name of Business DBA)"
    )
    business_phone: Optional[str] = Field(
        None,
        description="Business phone number",
        alias="(Business Phone)"
    )
    business_address: Optional[str] = Field(
        None,
        description="Business address including street directions and suite number if applicable",
        alias="(Business Address include street directions and suite number if applicable)"
    )
    city: Optional[str] = Field(
        None,
        description="City where business is located",
        alias="(City)"
    )
    zip_code: Optional[str] = Field(
        None,
        description="ZIP code of business location",
        alias="(Zip)"
    )
    business_email: Optional[str] = Field(
        None,
        description="Business email address",
        alias="(Business EMail)"
    )
    seating_capacity: Optional[str] = Field(
        None,
        description="Seating or bed capacity for licensed healthcare facilities",
        alias="(Seating  Bed Capacity Licensed Healthcare)"
    )
    square_footage: Optional[str] = Field(
        None,
        description="Square footage of the business premises",
        alias="(Square Footage)"
    )
    hours: Optional[str] = Field(
        None,
        description="Business operating hours",
        alias="(hours)"
    )
    is_lp: Optional[str] = Field(
        None,
        description="Limited Partnership status",
        alias="(LP)"
    )
    is_llp: Optional[str] = Field(
        None,
        description="Limited Liability Partnership status",
        alias="(LLP)"
    )
    is_corporation: Optional[str] = Field(
        None,
        description="Corporation status",
        alias="(Corporation)"
    )
    is_llc: Optional[str] = Field(
        None,
        description="Limited Liability Company status",
        alias="(LLC)"
    )
    business_owner: Optional[str] = Field(
        None,
        description="Name of business owner",
        alias="(Business Owner)"
    )
    owner_phone: Optional[str] = Field(
        None,
        description="Phone number of business owner",
        alias="(Owner Phone)"
    )

# class VoiceNote(BaseModel):
#   title: str = Field(description="A title for the voice note")
#   summary: str = Field(description="A short one sentence summary of the voice note.")
#   actionItems: list[str] = Field(
#       description="A list of action items from the voice note"
#   )