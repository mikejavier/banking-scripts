select person_id, full_name, mother_name, birthday, gender, cpf, idNumber, identityIssuingEntity, issuingDateIdentity, idFederativeUnit, idBusinessSource, idProduct, incomeValue, isPep, isPepSince, idAddressType, zipcode, street, number, complement, neighborhood, city, state, country, mailingAddress, idPhoneType, phoneAreaCode, phoneNumber
from (
select
		p.person_id person_id, 
        p.full_name full_name,
        p.mother_name mother_name,
        p.birthday birthday,
        'N' gender,
        LPAD(pd.number,11,'0') cpf,
        '' idNumber,
        '' identityIssuingEntity,
        '' issuingDateIdentity,
        '' idFederativeUnit,
        '1' idBusinessSource,
        '1' idProduct,
        '1500' incomeValue,
        'false' isPep,
        '' isPepSince,
        '1' idAddressType,
        LPAD(pa.zipcode, 8, '0') zipcode,
        substr(pa.street_name ,1, 40) street,
        case when pa.place_numbering  = '' or pa.place_numbering is null then '0' else pa.place_numbering end number,
        substr(pa.extra_information, 1, 30) complement,
		substr(case when pa.neighborhood = '' or pa.neighborhood is null then 'Centro' else pa.neighborhood end, 1, 40) neighborhood,
		substr(pa.city, 1, 30) city,
		pa.state state,
        'Brasil' country,
        'true' mailingAddress,
        '18' idPhoneType,
        '011' phoneAreaCode,
        '987654321' phoneNumber
		  , ROW_NUMBER() over (partition by p.person_id order by pa.last_updated_at desc) rnk
  from people.person p
  left join people.document pd on p.person_id  = pd.person_id 
  left outer join people.address pa on p.person_id  = pa.person_id
  where
    p.country_id = 1
    and pd.type_id = 1 
    and p.person_id in ()
  order by p.created_at asc
) ttt 
where rnk = 1