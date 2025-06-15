-- 1) 기존 members 테이블: 주요 회원 정보만 저장
create table members (
  id int auto_increment primary key,
  userid varchar(100) unique not null,       -- 이메일 = 사용자 id
  name varchar(50) not null,
  password varchar(255) not null,            -- 암호화된 비밀번호
  phone varchar(20),
  gender ENUM('남자', '여자'),
  education ENUM('고졸','대학교','대학원'),
  nickname varchar(50),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
) engine=innodb default charset=utf8mb4;

-- 2) memberinfos 테이블: 스터디 매칭 및 관리자용 추가 정보 저장
create table memberinfos (
  member_id int primary key,                 -- members.id 와 1:1 매핑
  major varchar(50),
  area varchar(50),
  timezone varchar(50),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  constraint fk_memberinfos_members
    foreign key (member_id)
    references members(id)
    on delete cascade
    on update cascade
) engine=innodb default charset=utf8mb4;